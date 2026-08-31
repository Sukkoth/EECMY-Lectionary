import React, { forwardRef, useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import {
  formatMonth,
  getDaysInEthiopianMonth,
  ethiopianToGregorian,
  gregorianYmdToEthiopian,
  getShortWeekdayNames,
} from "@/lib/ethiopianCalendar";
import { isDevice24Hour, formatTimeSlot } from "@/lib/timeFormat";
import { useTags, useCreateTag, useDeleteTag } from "@/lib/hooks/useTags";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/lib/hooks/useEvents";
import { ensurePermissions, parseTimeString } from "@/lib/NotificationService";

export type ReminderOffset =
  | "at_time"
  | "30_min"
  | "1_hour"
  | "2_hours"
  | "1_day"
  | "2_days"
  | "1_week";

export const REMINDER_OFFSETS: {
  id: ReminderOffset;
  labelKey: TranslationKey;
}[] = [
  { id: "at_time", labelKey: "offsetAtTime" },
  { id: "30_min", labelKey: "offset30Min" },
  { id: "1_hour", labelKey: "offset1Hour" },
  { id: "2_hours", labelKey: "offset2Hours" },
  { id: "1_day", labelKey: "offset1Day" },
  { id: "2_days", labelKey: "offset2Days" },
  { id: "1_week", labelKey: "offset1Week" },
];

export function getOffsetLabel(
  offset: (typeof REMINDER_OFFSETS)[number],
  t: (key: TranslationKey) => string,
): string {
  return t(offset.labelKey);
}

export function getDefaultEventReminderDate(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 2, 0, 0);
  return d;
}

export type CustomEventData = {
  id: string;
  title: string;
  tagId?: string | null;
  tagName?: string | null;
  tagColor?: string | null;
  date: string; // YYYY-MM-DD (canonical GC)
  hasReminder: boolean;
  reminderTime?: string;
  reminderOffsets?: ReminderOffset[];
  notes?: string;
};

type AddEventModalProps = {
  selectedYear: number;
  selectedMonth: number;
  isEth: boolean;
  initialDay?: number;
  eventToEdit?: CustomEventData | null;
  onSave?: (event: CustomEventData) => void;
  onDeleteEvent?: (eventId: string) => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
};

const PALETTE_COLORS = [
  "#8b5cf6", // Purple
  "#6366f1", // Indigo
  "#a855f7", // Violet
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Crimson Red
  "#f97316", // Tangerine Orange
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

export const AddEventModal = forwardRef<BottomSheetModal, AddEventModalProps>(
  (
    {
      selectedYear,
      selectedMonth,
      isEth,
      initialDay,
      eventToEdit,
      onSave,
      onDeleteEvent,
      onClose,
      onChange,
      onDismiss,
    },
    ref,
  ) => {
    const isDark = useIsDark();
    const { t, lang } = useTranslation();
    const isEditMode = Boolean(eventToEdit);

    const { data: dbTags = [] } = useTags();
    const { mutate: createTagMutation } = useCreateTag();
    const { mutate: deleteTagMutation } = useDeleteTag();

    const { mutateAsync: createEventAsync, isPending: isCreating } = useCreateEvent();
    const { mutateAsync: updateEventAsync, isPending: isUpdating } = useUpdateEvent();
    const { mutateAsync: deleteEventAsync, isPending: isDeleting } = useDeleteEvent();
    const isSubmitting = isCreating || isUpdating;

    const titleRef = useRef(eventToEdit?.title || "");
    const notesRef = useRef(eventToEdit?.notes || "");
    const newTagNameRef = useRef("");
    const newTagInputRef = useRef<any>(null);
    const scrollViewRef = useRef<any>(null);

    const [selectedTagId, setSelectedTagId] = useState<string | null>(
      eventToEdit?.tagId ?? null,
    );
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagColor, setNewTagColor] = useState(PALETTE_COLORS[0]);
    const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);

    const [selectedDay, setSelectedDay] = useState(() => {
      if (eventToEdit?.date) {
        const [gcY, gcM, gcD] = eventToEdit.date.split("-").map(Number);
        if (isEth) {
          const eth = gregorianYmdToEthiopian(gcY, gcM - 1, gcD);
          return eth.day;
        }
        return gcD;
      }
      return initialDay ?? 1;
    });

    const [hasReminder, setHasReminder] = useState(eventToEdit?.hasReminder ?? false);
    const [isTitleFilled, setIsTitleFilled] = useState(
      Boolean(eventToEdit?.title && eventToEdit.title.trim().length > 0),
    );
    const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>(() => {
      if (eventToEdit?.reminderOffsets && eventToEdit.reminderOffsets.length > 0) {
        return eventToEdit.reminderOffsets;
      }
      return ["at_time"];
    });

    const is24H = useMemo(() => isDevice24Hour(), []);
    const [reminderDate, setReminderDate] = useState(() => {
      return getDefaultEventReminderDate();
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(() => {
      if (eventToEdit?.reminderTime) return eventToEdit.reminderTime;
      const d = getDefaultEventReminderDate();
      return formatTimeSlot(d.getHours(), d.getMinutes(), isDevice24Hour());
    });

    const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setShowTimePicker(false);
      }
      if (date) {
        setReminderDate(date);
        setSelectedTime(formatTimeSlot(date.getHours(), date.getMinutes(), is24H));
      }
    };

    const dayScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
    const snapPoints = useMemo(() => ["85%"], []);
    const isMountedRef = useRef(false);

    const daysInMonth = useMemo(() => {
      if (isEth) {
        return getDaysInEthiopianMonth(selectedYear, selectedMonth);
      }
      return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    }, [selectedYear, selectedMonth, isEth]);

    const scrollToSelectedDay = useCallback((day: number, animated = true) => {
      const targetIndex = Math.max(0, day - 1);
      const itemWidth = 62; // 54px minWidth + 8px mr-2
      const offset = Math.max(0, targetIndex * itemWidth - 140);
      dayScrollRef.current?.scrollTo({ x: offset, animated });
    }, []);

    // Synchronize form when eventToEdit or initialDay changes
    useEffect(() => {
      if (eventToEdit) {
        titleRef.current = eventToEdit.title;
        notesRef.current = eventToEdit.notes || "";
        setIsTitleFilled(eventToEdit.title.trim().length > 0);
        setSelectedTagId(eventToEdit.tagId ?? null);
        setHasReminder(eventToEdit.hasReminder);

        if (eventToEdit.reminderOffsets && eventToEdit.reminderOffsets.length > 0) {
          setReminderOffsets(eventToEdit.reminderOffsets);
        } else {
          setReminderOffsets(["at_time"]);
        }

        if (eventToEdit.reminderTime) {
          setSelectedTime(eventToEdit.reminderTime);
          const parsed = parseTimeString(eventToEdit.reminderTime);
          if (parsed) {
            const d = new Date();
            d.setHours(parsed.hours, parsed.minutes, 0, 0);
            setReminderDate(d);
          }
        } else {
          const d = getDefaultEventReminderDate();
          setSelectedTime(formatTimeSlot(d.getHours(), d.getMinutes(), is24H));
          setReminderDate(d);
        }

        if (eventToEdit.date) {
          const [gcY, gcM, gcD] = eventToEdit.date.split("-").map(Number);
          const targetDay = isEth ? gregorianYmdToEthiopian(gcY, gcM - 1, gcD).day : gcD;
          if (targetDay >= 1 && targetDay <= daysInMonth) {
            setSelectedDay(targetDay);
            const timer = setTimeout(() => scrollToSelectedDay(targetDay, true), 100);
            return () => clearTimeout(timer);
          }
        }
      } else {
        titleRef.current = "";
        notesRef.current = "";
        setIsTitleFilled(false);
        setSelectedTagId(null);
        setHasReminder(false);
        setReminderOffsets(["at_time"]);
        const d = getDefaultEventReminderDate();
        setSelectedTime(formatTimeSlot(d.getHours(), d.getMinutes(), is24H));
        setReminderDate(d);
        if (initialDay && initialDay >= 1 && initialDay <= daysInMonth) {
          setSelectedDay(initialDay);
          const timer = setTimeout(() => scrollToSelectedDay(initialDay, true), 100);
          return () => clearTimeout(timer);
        }
      }
    }, [eventToEdit, initialDay, daysInMonth, scrollToSelectedDay, is24H, isEth]);

    const daysList = useMemo(() => {
      const list: { day: number; weekdayName: string; isSunday: boolean }[] = [];
      const shortWeekdays = getShortWeekdayNames(lang);

      for (let d = 1; d <= daysInMonth; d++) {
        let weekdayIndex = 0;
        if (isEth) {
          const gc = ethiopianToGregorian(selectedYear, selectedMonth, d);
          weekdayIndex = new Date(gc.year, gc.month, gc.day).getDay();
        } else {
          weekdayIndex = new Date(selectedYear, selectedMonth, d).getDay();
        }

        const weekdayName = shortWeekdays[weekdayIndex] || "";
        list.push({ day: d, weekdayName, isSunday: weekdayIndex === 0 });
      }
      return list;
    }, [selectedYear, selectedMonth, daysInMonth, isEth, lang]);

    const handleSheetChange = useCallback(
      (index: number) => {
        onChange?.(index);
        if (index === -1) {
          isMountedRef.current = false;
          setIsCreatingTag(false);
          setShowTimePicker(false);
          setReminderOffsets(["at_time"]);
          setSelectedTagId(null);
          setHasReminder(false);
          setIsTitleFilled(false);
          newTagNameRef.current = "";
          newTagInputRef.current?.clear();
        }
      },
      [onChange],
    );

    const handleDismiss = useCallback(() => {
      isMountedRef.current = false;
      setIsCreatingTag(false);
      setShowTimePicker(false);
      setReminderOffsets(["at_time"]);
      setSelectedTagId(null);
      setHasReminder(false);
      setIsTitleFilled(false);
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      onDismiss?.();
    }, [onDismiss]);

    const dateDisplay = useMemo(() => {
      const mName = formatMonth(selectedMonth, isEth, lang);
      return `${mName} ${selectedDay}, ${selectedYear}`;
    }, [selectedMonth, selectedDay, selectedYear, isEth, lang]);

    const isPastDate = useMemo(() => {
      let gcYear = selectedYear;
      let gcMonth = selectedMonth;
      let gcDay = selectedDay;
      if (isEth) {
        const gc = ethiopianToGregorian(selectedYear, selectedMonth, selectedDay);
        gcYear = gc.year;
        gcMonth = gc.month;
        gcDay = gc.day;
      }
      const endOfSelectedDay = new Date(gcYear, gcMonth, gcDay, 23, 59, 59, 999);
      return endOfSelectedDay.getTime() < Date.now();
    }, [selectedYear, selectedMonth, selectedDay, isEth]);

    const handleSave = async () => {
      const enteredTitle = titleRef.current.trim();
      if (!enteredTitle || isSubmitting) return;

      const activeTag = selectedTagId
        ? dbTags.find((t) => t.id === selectedTagId)
        : null;

      let canonicalGcDate: string;
      if (isEth) {
        const gc = ethiopianToGregorian(selectedYear, selectedMonth, selectedDay);
        canonicalGcDate = `${gc.year}-${String(gc.month + 1).padStart(2, "0")}-${String(gc.day).padStart(2, "0")}`;
      } else {
        canonicalGcDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      }

      const effectiveHasReminder = !isPastDate && hasReminder;

      if (effectiveHasReminder) {
        const { granted } = await ensurePermissions();
        if (!granted) {
          console.warn("[AddEventModal] Reminder notifications not granted by system.");
        }
      }

      const eventPayload: CustomEventData = {
        id: eventToEdit ? eventToEdit.id : String(Date.now()),
        title: enteredTitle,
        tagId: selectedTagId ?? undefined,
        tagName: activeTag?.name,
        tagColor: activeTag?.color,
        date: canonicalGcDate,
        hasReminder: effectiveHasReminder,
        reminderTime: effectiveHasReminder ? selectedTime : undefined,
        reminderOffsets: effectiveHasReminder ? reminderOffsets : undefined,
        notes: notesRef.current.trim() || undefined,
      };

      try {
        let timeoutHandle: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => {
            reject(new Error("SAVE_TIMEOUT"));
          }, 5000);
          timeoutHandle?.unref?.();
        });

        const mutationPromise = eventToEdit
          ? updateEventAsync({
              id: eventPayload.id,
              title: eventPayload.title,
              date: eventPayload.date,
              reminderTime: eventPayload.reminderTime,
              notes: eventPayload.notes,
              tagId: eventPayload.tagId ?? null,
              tagName: eventPayload.tagName ?? null,
              tagColor: eventPayload.tagColor ?? null,
              reminderOffsets: eventPayload.reminderOffsets,
            })
          : createEventAsync({
              id: eventPayload.id,
              title: eventPayload.title,
              date: eventPayload.date,
              reminderTime: eventPayload.reminderTime,
              notes: eventPayload.notes,
              tagId: eventPayload.tagId ?? null,
              tagName: eventPayload.tagName ?? null,
              tagColor: eventPayload.tagColor ?? null,
              reminderOffsets: eventPayload.reminderOffsets,
            });

        await Promise.race([mutationPromise, timeoutPromise]).finally(() => {
          clearTimeout(timeoutHandle);
        });

        onSave?.(eventPayload);

        // Clear inputs only after mutation successfully finishes
        titleRef.current = "";
        notesRef.current = "";
        newTagNameRef.current = "";
        newTagInputRef.current?.clear();
        setIsCreatingTag(false);
        setShowTimePicker(false);
        setReminderOffsets(["at_time"]);
        setSelectedTagId(null);
        setHasReminder(false);
        setIsTitleFilled(false);
        setShowDeleteEventConfirm(false);

        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        onClose?.();
      } catch (err) {
        console.warn("[AddEventModal] Failed to persist event:", err);
        Alert.alert(
          t("notificationTimeoutTitle"),
          t("notificationTimeoutDesc"),
          [{ text: "OK" }],
        );
      }
    };

    const handleCancel = () => {
      titleRef.current = "";
      notesRef.current = "";
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      setIsCreatingTag(false);
      setShowTimePicker(false);
      setReminderOffsets(["at_time"]);
      setSelectedTagId(null);
      setHasReminder(false);
      setIsTitleFilled(false);
      setShowDeleteEventConfirm(false);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
    };

    const confirmDeleteEvent = async () => {
      if (!eventToEdit || isDeleting) return;
      try {
        await deleteEventAsync(eventToEdit.id);
        onDeleteEvent?.(eventToEdit.id);
        setShowDeleteEventConfirm(false);
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        onClose?.();
      } catch (err) {
        console.warn("Failed to delete event:", err);
      }
    };

    const handleToggleReminder = async (value: boolean) => {
      if (value) {
        if (!eventToEdit?.reminderTime) {
          const d = getDefaultEventReminderDate();
          setSelectedTime(formatTimeSlot(d.getHours(), d.getMinutes(), is24H));
          setReminderDate(d);
        }
        const { granted } = await ensurePermissions();
        if (!granted) {
          setHasReminder(false);
          return;
        }
      }
      setHasReminder(value);
    };

    const handleToggleOffset = (offsetId: ReminderOffset) => {
      setReminderOffsets((prev) => {
        if (prev.includes(offsetId)) {
          return prev.filter((id) => id !== offsetId);
        }
        if (prev.length >= 3) {
          return prev; // Capped at max 3 alerts
        }
        return [...prev, offsetId];
      });
    };

    const handleAddCustomTag = () => {
      const enteredName = newTagNameRef.current.trim();
      if (!enteredName) return;
      const tagId = `tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      createTagMutation({
        id: tagId,
        name: enteredName,
        color: newTagColor,
      });
      setSelectedTagId(tagId);
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      setIsCreatingTag(false);
    };

    const handleDeleteCustomTag = (tagId: string) => {
      const targetTag = dbTags.find((t) => t.id === tagId);
      setTagToDelete({ id: tagId, name: targetTag?.name || "" });
    };

    const confirmDeleteTag = () => {
      if (!tagToDelete) return;
      const tagId = tagToDelete.id;
      deleteTagMutation(tagId);
      if (selectedTagId === tagId) {
        setSelectedTagId(null);
      }
      setTagToDelete(null);
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#524C46" : "#D1D1D6",
          width: 36,
        }}
        backgroundStyle={{
          backgroundColor: isDark ? "#171513" : "#FFFFFF",
          borderRadius: 24,
        }}
      >
        <BottomSheetScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Header Row */}
          <View className="mb-4 flex-row items-center justify-between border-b border-stone-200/60 pb-3 dark:border-stone-800/60">
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              className="py-1 px-2"
            >
              <Text
                allowFontScaling={false}
                className="text-sm font-medium text-muted dark:text-muted-dark"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("cancel")}
              </Text>
            </TouchableOpacity>

            <Text
              allowFontScaling={false}
              className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {isEditMode ? t("editEvent") : t("newEvent")}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!isTitleFilled || isSubmitting}
              activeOpacity={0.7}
              className={`h-9 min-w-[68px] rounded-full px-4 items-center justify-center ${
                isTitleFilled && !isSubmitting
                  ? "bg-primary"
                  : "bg-stone-300/70 dark:bg-stone-800/80"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  allowFontScaling={false}
                  className={`text-xs font-semibold ${
                    isTitleFilled
                      ? "text-white"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("save")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Event Title Input */}
          <Text
            allowFontScaling={false}
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("eventTitle")}
          </Text>
          <BottomSheetTextInput
            key={eventToEdit ? `title-${eventToEdit.id}` : "title-new"}
            defaultValue={eventToEdit?.title || ""}
            onChangeText={(text) => {
              titleRef.current = text;
              const hasText = text.trim().length > 0;
              setIsTitleFilled((prev) => (prev !== hasText ? hasText : prev));
            }}
            placeholder={t("eventTitlePlaceholder")}
            placeholderTextColor={isDark ? "#8A8480" : "#A8A29E"}
            className="mb-4 rounded-2xl border border-stone-200/90 bg-[#F5F2EB] px-4 py-3.5 text-base text-[#2D2A24] dark:border-stone-700/60 dark:bg-[#25221E] dark:text-[#F3EFE6]"
            style={{ fontFamily: "ReadingFont", paddingHorizontal: 16, paddingVertical: 14 }}
          />

          {/* Date Summary Card */}
          <Text
            allowFontScaling={false}
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("date")}
          </Text>
          <View className="mb-3 flex-row items-center gap-2.5 rounded-2xl border border-stone-200/90 bg-[#F5F2EB] px-4 py-3.5 dark:border-stone-700/60 dark:bg-[#25221E]">
            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
            <Text
              allowFontScaling={false}
              className="text-sm font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {dateDisplay}
            </Text>
            <View className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text
                allowFontScaling={false}
                className="text-primary text-[10px] font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {isEth ? t("ethiopian") : t("gregorian")}
              </Text>
            </View>
          </View>

          {/* Horizontal Day Selector Scroller */}
          <ScrollView
            ref={dayScrollRef}
            horizontal
            keyboardShouldPersistTaps="always"
            showsHorizontalScrollIndicator={false}
            className="mb-5"
            onContentSizeChange={() => {
              if (!isMountedRef.current) {
                isMountedRef.current = true;
                scrollToSelectedDay(initialDay ?? 1, false);
              }
            }}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {daysList.map((item) => {
              const isSelected = item.day === selectedDay;
              return (
                <TouchableOpacity
                  key={item.day}
                  onPress={() => setSelectedDay(item.day)}
                  activeOpacity={0.7}
                  className={`mr-2 items-center justify-center rounded-2xl px-3.5 py-2.5 border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-[#F5F2EB] dark:bg-[#25221E] border-stone-200/90 dark:border-stone-700/60"
                  }`}
                  style={{ minWidth: 54 }}
                >
                  <Text
                    allowFontScaling={false}
                    className={`text-[10px] font-medium uppercase ${
                      isSelected
                        ? "text-white/80"
                        : item.isSunday
                        ? "text-primary/80"
                        : "text-muted dark:text-muted-dark"
                    }`}
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {item.weekdayName}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    className={`text-base font-semibold mt-0.5 ${
                      isSelected
                        ? "text-white"
                        : item.isSunday
                        ? "text-primary font-bold"
                        : "text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tag Header */}
          <Text
            allowFontScaling={false}
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("tag")}
          </Text>

          {/* Inline Tag Creator Tray */}
          {isCreatingTag && (
            <View className="mb-3.5 rounded-2xl border border-primary/30 bg-[#F5F2EB] p-3.5 dark:border-primary/40 dark:bg-[#25221E]">
              <Text
                allowFontScaling={false}
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("newTagName")}
              </Text>
              <BottomSheetTextInput
                ref={newTagInputRef}
                defaultValue=""
                onChangeText={(text) => {
                  newTagNameRef.current = text;
                }}
                placeholder={t("newTagPlaceholder")}
                placeholderTextColor={isDark ? "#8A8480" : "#A8A29E"}
                className="mb-3 rounded-xl border border-stone-200/90 bg-white px-3.5 py-2.5 text-sm text-[#2D2A24] dark:border-stone-700/60 dark:bg-[#1A1815] dark:text-[#F3EFE6]"
                style={{ fontFamily: "ReadingFont", paddingHorizontal: 14, paddingVertical: 10 }}
              />

              <Text
                allowFontScaling={false}
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("selectColor")}
              </Text>
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                className="mb-3.5"
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {PALETTE_COLORS.map((c) => {
                  const isColorSelected = newTagColor === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setNewTagColor(c)}
                      activeOpacity={0.7}
                      className="mr-2.5 items-center justify-center py-1"
                    >
                      <View
                        className="h-7 w-7 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: c,
                          borderWidth: isColorSelected ? 2.5 : 0,
                          borderColor: isDark ? "#FFFFFF" : "#1A1815",
                        }}
                      >
                        {isColorSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View className="flex-row items-center justify-end gap-2 pt-1">
                <TouchableOpacity
                  onPress={() => {
                    setIsCreatingTag(false);
                    newTagNameRef.current = "";
                    newTagInputRef.current?.clear();
                  }}
                  className="px-3 py-1.5"
                >
                  <Text
                    allowFontScaling={false}
                    className="text-xs font-medium text-muted dark:text-muted-dark"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddCustomTag}
                  activeOpacity={0.7}
                  className="bg-primary rounded-xl px-3.5 py-1.5 flex-row items-center gap-1"
                >
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  <Text
                    allowFontScaling={false}
                    className="text-xs font-semibold text-white"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("addTag")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Category Chips Horizontal Scroller */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            className="mb-5"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {/* + Add Tag Button as First Chip */}
            <TouchableOpacity
              onPress={() => setIsCreatingTag((prev) => !prev)}
              activeOpacity={0.7}
              className={`h-9 mr-2 flex-row items-center gap-1 rounded-full border border-dashed px-3.5 ${
                isCreatingTag
                  ? "border-primary bg-primary/20 dark:bg-primary/30"
                  : "border-primary/50 bg-primary/5 dark:border-primary/40 dark:bg-primary/10"
              }`}
            >
              <Text
                allowFontScaling={false}
                className="text-primary text-base font-semibold"
                style={{ fontFamily: "ReadingFont", lineHeight: 18 }}
              >
                +
              </Text>
              <Text
                allowFontScaling={false}
                className="text-primary text-xs font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("add")}
              </Text>
            </TouchableOpacity>

            {/* User Custom Tags */}
            {dbTags.map((tag) => {
              const isSelected = selectedTagId === tag.id;
              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => setSelectedTagId((prev) => (prev === tag.id ? null : tag.id))}
                  activeOpacity={0.7}
                  className={`h-9 mr-2 flex-row items-center gap-1.5 rounded-full border px-3.5 ${
                    isSelected
                      ? "border-primary bg-primary/15 dark:bg-primary/25"
                      : "border-stone-200/90 bg-[#F5F2EB] dark:border-stone-700/60 dark:bg-[#25221E]"
                  }`}
                >
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <Text
                    allowFontScaling={false}
                    className={`text-xs ${
                      isSelected
                        ? "font-semibold text-primary"
                        : "font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {tag.name}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleDeleteCustomTag(tag.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    className="ml-0.5"
                  >
                    <Ionicons
                      name="close-circle"
                      size={14}
                      color={isDark ? "#8A8480" : "#A8A29E"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Reminder Section (Inset-Grouped Card) - Omitted if selected date is in the past */}
          {!isPastDate && (
            <View className="mb-4 overflow-hidden rounded-2xl border border-stone-200/90 bg-[#F5F2EB] dark:border-stone-700/60 dark:bg-[#25221E]">
              {/* Row 1: Enable Reminder Switch */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-1 pr-2 flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1A1815] border border-stone-200/80 dark:border-stone-700/50">
                    <Ionicons
                      name={hasReminder ? "notifications" : "notifications-off-outline"}
                      size={18}
                      color={hasReminder ? "#3b82f6" : "#8A8480"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      allowFontScaling={false}
                      className="text-sm font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {t("reminder")}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      className="text-xs text-muted dark:text-muted-dark mt-0.5"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {t("sendAlertForEvent")}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={hasReminder}
                  onValueChange={handleToggleReminder}
                  trackColor={{ false: isDark ? "#3A3530" : "#D1D1D6", true: "#3b82f6" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {hasReminder && (
                <>
                  {/* Divider */}
                  <View className="h-[1px] bg-stone-200/80 dark:bg-stone-700/50" />

                  {/* Row 2: Event Time Picker Trigger */}
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-4 py-3.5"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Ionicons name="time-outline" size={17} color={isDark ? "#E8E4DC" : "#2D2A24"} />
                      <Text
                        allowFontScaling={false}
                        className="text-sm font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {t("eventTime")}
                      </Text>
                    </View>

                    <View className="h-9 flex-row items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3 dark:border-stone-700/60 dark:bg-[#1A1815]">
                      <Text
                        allowFontScaling={false}
                        className="text-sm font-semibold text-[#2D2A24] dark:text-[#F3EFE6]"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {selectedTime}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={13}
                        color={isDark ? "#8A8480" : "#A8A29E"}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="h-[1px] bg-stone-200/80 dark:bg-stone-700/50" />

                  {/* Row 3: Alert Timing (When to Notify) */}
                  <View className="px-4 py-3.5">
                    <View className="mb-2.5 flex-row items-center justify-between pr-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="alarm-outline" size={16} color={isDark ? "#E8E4DC" : "#2D2A24"} />
                        <Text
                          allowFontScaling={false}
                          className="text-sm font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {t("alerts")}
                        </Text>
                      </View>
                      {reminderOffsets.length > 0 && (
                        <View className="bg-primary/10 rounded-full px-2 py-0.5">
                          <Text
                            allowFontScaling={false}
                            className="text-primary text-[11px] font-semibold"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {reminderOffsets.length}/3
                          </Text>
                        </View>
                      )}
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyboardShouldPersistTaps="always"
                      contentContainerStyle={{ paddingRight: 8 }}
                    >
                      {REMINDER_OFFSETS.map((offset) => {
                        const isOffsetSelected = reminderOffsets.includes(offset.id);
                        const isMaxReached = reminderOffsets.length >= 3 && !isOffsetSelected;
                        return (
                          <TouchableOpacity
                            key={offset.id}
                            onPress={() => handleToggleOffset(offset.id)}
                            activeOpacity={0.7}
                            className={`h-9 mr-2 items-center justify-center rounded-xl border px-3.5 ${
                              isOffsetSelected
                                ? "border-primary bg-primary"
                                : isMaxReached
                                  ? "border-stone-200/50 bg-white/50 opacity-40 dark:border-stone-800 dark:bg-[#1A1815]/50"
                                  : "border-stone-200/90 bg-white dark:border-stone-700/60 dark:bg-[#1A1815]"
                            }`}
                          >
                            <Text
                              allowFontScaling={false}
                              className={`text-xs ${
                                isOffsetSelected
                                  ? "font-semibold text-white"
                                  : "font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
                              }`}
                              style={{ fontFamily: "ReadingFont" }}
                            >
                              {t(offset.labelKey)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {showTimePicker && (
                    <DateTimePicker
                      value={reminderDate}
                      mode="time"
                      is24Hour={is24H}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                    />
                  )}
                </>
              )}
            </View>
          )}

          {/* Notes (Optional) */}
          <Text
            allowFontScaling={false}
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("notesOptional")}
          </Text>
          <BottomSheetTextInput
            key={eventToEdit ? `notes-${eventToEdit.id}` : "notes-new"}
            defaultValue={eventToEdit?.notes || ""}
            onChangeText={(text) => {
              notesRef.current = text;
            }}
            multiline
            numberOfLines={10}
            placeholder={t("notesPlaceholder")}
            placeholderTextColor={isDark ? "#8A8480" : "#A8A29E"}
            className="rounded-2xl border border-stone-200/90 bg-[#F5F2EB] px-4 py-3.5 text-sm text-[#2D2A24] dark:border-stone-700/60 dark:bg-[#25221E] dark:text-[#F3EFE6]"
            style={{
              fontFamily: "ReadingFont",
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 14,
              minHeight: 110,
              textAlignVertical: "top",
            }}
          />

          {/* Edit Mode: Delete Event Action Button / Inline Confirmation */}
          {isEditMode && (
            <View className="mt-6 mb-2">
              {showDeleteEventConfirm ? (
                <View className="rounded-2xl border border-red-200/80 bg-red-50/70 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                  <Text
                    allowFontScaling={false}
                    className="mb-1 text-sm font-semibold text-red-700 dark:text-red-300"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("deleteEventConfirmTitle")}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    className="mb-4 text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("deleteEventConfirmDesc")}
                  </Text>
                  <View className="flex-row items-center justify-end gap-2.5">
                    <TouchableOpacity
                      onPress={() => setShowDeleteEventConfirm(false)}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                      className="rounded-xl bg-white px-4 py-2 dark:bg-[#1C1C1C] border border-stone-200/60 dark:border-stone-800/60"
                    >
                      <Text
                        allowFontScaling={false}
                        className="text-xs font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {t("cancel")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={confirmDeleteEvent}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                      className="h-8 min-w-[70px] rounded-xl bg-red-600 px-4 items-center justify-center dark:bg-red-500"
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text
                          allowFontScaling={false}
                          className="text-xs font-semibold text-white"
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {t("delete")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowDeleteEventConfirm(true)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50/50 py-3.5 dark:border-red-900/40 dark:bg-red-950/20"
                >
                  <Ionicons name="trash-outline" size={17} color="#ef4444" />
                  <Text
                    allowFontScaling={false}
                    className="text-sm font-semibold text-red-600 dark:text-red-400"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("deleteEvent")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </BottomSheetScrollView>

        {/* Delete Tag Confirmation Modal (matching Favourites modal style) */}
        <Modal
          visible={!!tagToDelete}
          transparent
          animationType="fade"
          onRequestClose={() => setTagToDelete(null)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-8">
            <View className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#1C1C1C] border border-stone-200/60 dark:border-stone-800/60 shadow-lg">
              <Text
                allowFontScaling={false}
                className="mb-2 text-xl font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                {lang === "am"
                  ? `"${tagToDelete?.name}" ታግ ይጥፋ?`
                  : lang === "om"
                  ? `"${tagToDelete?.name}" haquu?`
                  : `Delete "${tagToDelete?.name}"?`}
              </Text>
              <Text
                allowFontScaling={false}
                className="mb-6 text-sm text-muted dark:text-muted-dark leading-relaxed"
                style={{ fontFamily: "ReadingFont" }}
              >
                {lang === "am"
                  ? "ይህን ታግ ሲያጠፉ፣ የተመደቡባቸው ክስተቶች አይጠፉም፤ ነገር ግን ታጋቸው ባዶ ይሆናል።"
                  : lang === "om"
                  ? "Taagii kana haquun ni balleessa. Qophiileen taagii kanaan uumaman ni tursiifamu, garuu taagiin isaanii hin ramadamu."
                  : "Deleting this tag will remove it. Events created under this tag will be kept, but their tag will be set to uncategorized."}
              </Text>
              <View className="flex-row justify-end gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="rounded-xl bg-stone-100 px-5 py-2.5 dark:bg-[#2A2A2A]"
                  onPress={() => setTagToDelete(null)}
                >
                  <Text
                    allowFontScaling={false}
                    className="text-center text-sm font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="rounded-xl bg-red-600 dark:bg-red-500 px-5 py-2.5"
                  onPress={confirmDeleteTag}
                >
                  <Text
                    allowFontScaling={false}
                    className="text-center text-sm font-semibold text-white"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("delete")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </BottomSheetModal>
    );
  },
);

AddEventModal.displayName = "AddEventModal";
