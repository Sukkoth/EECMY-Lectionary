import React, { forwardRef, useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  Modal,
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
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import {
  formatMonth,
  getDaysInEthiopianMonth,
  ethiopianToGregorian,
} from "@/lib/ethiopianCalendar";
import { isDevice24Hour, formatTimeSlot } from "@/lib/timeFormat";

export type CategoryItem = {
  id: string;
  labelEn: string;
  labelAm: string;
  labelOm?: string;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isCustom?: boolean;
};

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
  labelEn: string;
  labelAm: string;
  labelOm: string;
}[] = [
  { id: "at_time", labelEn: "At time of event", labelAm: "በሰዓቱ", labelOm: "Yeroo qophiitti" },
  { id: "30_min", labelEn: "30 min before", labelAm: "30 ደ/ቅ በፊት", labelOm: "Daqiiqaa 30 dura" },
  { id: "1_hour", labelEn: "1 hour before", labelAm: "1 ሰዓት በፊት", labelOm: "Sa'aatii 1 dura" },
  { id: "2_hours", labelEn: "2 hours before", labelAm: "2 ሰዓት በፊት", labelOm: "Sa'aatii 2 dura" },
  { id: "1_day", labelEn: "1 day before", labelAm: "1 ቀን በፊት", labelOm: "Guyyaa 1 dura" },
  { id: "2_days", labelEn: "2 days before", labelAm: "2 ቀናት በፊት", labelOm: "Guyyoota 2 dura" },
  { id: "1_week", labelEn: "1 week before", labelAm: "1 ሳምንት በፊት", labelOm: "Torban 1 dura" },
];

export function getCategoryLabel(cat: CategoryItem, lang: string): string {
  if (lang === "om") return cat.labelOm || cat.labelEn;
  if (lang === "am") return cat.labelAm;
  return cat.labelEn;
}

export function getOffsetLabel(offset: (typeof REMINDER_OFFSETS)[number], lang: string): string {
  if (lang === "om") return offset.labelOm || offset.labelEn;
  if (lang === "am") return offset.labelAm;
  return offset.labelEn;
}

export type CustomEventData = {
  id: string;
  title: string;
  category?: string | null;
  categoryColor?: string | null;
  date: string; // YYYY-MM-DD
  hasReminder: boolean;
  reminderTime?: string;
  reminderOffsets?: ReminderOffset[];
  reminderOffset?: ReminderOffset;
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

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "liturgy", labelEn: "Liturgy", labelAm: "ሥርዓተ አምልኮ", labelOm: "Sirna Sagadaa", color: "#3b82f6", icon: "book-outline" },
  { id: "sermon", labelEn: "Sermon", labelAm: "ስብከት", labelOm: "Lallaba", color: "#8b5cf6", icon: "mic-outline" },
  { id: "choir", labelEn: "Choir", labelAm: "ዝማሬ", labelOm: "Faarfannaa", color: "#10b981", icon: "musical-notes-outline" },
  { id: "prayer", labelEn: "Prayer", labelAm: "ጸሎት", labelOm: "Kadhannaa", color: "#f59e0b", icon: "flame-outline" },
  { id: "meeting", labelEn: "Meeting", labelAm: "ስብሰባ", labelOm: "Walga'ii", color: "#0ea5e9", icon: "people-outline" },
  { id: "conference", labelEn: "Conference", labelAm: "ኮንፈረንስ", labelOm: "Koonfaransii", color: "#6366f1", icon: "globe-outline" },
  { id: "training", labelEn: "Training", labelAm: "ስልጠና", labelOm: "Leenjii", color: "#14b8a6", icon: "school-outline" },
  { id: "retreat", labelEn: "Retreat", labelAm: "መንፈሳዊ ዕረፍት", labelOm: "Boqonnaa Hafuuraa", color: "#ec4899", icon: "leaf-outline" },
  { id: "wedding", labelEn: "Wedding", labelAm: "ጋብቻ", labelOm: "Gaa'ila", color: "#f43f5e", icon: "heart-outline" },
];

export function getCategoryNameById(catId?: string | null, lang = "en"): string | null {
  if (!catId) return null;
  const match = DEFAULT_CATEGORIES.find((c) => c.id === catId);
  if (!match) return catId;
  return getCategoryLabel(match, lang);
}

const PALETTE_COLORS = [
  "#3b82f6", // Blue
  "#2563eb", // Royal Blue
  "#0ea5e9", // Sky Blue
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#10b981", // Emerald
  "#16a34a", // Green
  "#84cc16", // Lime
  "#eab308", // Yellow
  "#f59e0b", // Amber
  "#f97316", // Orange
  "#ef4444", // Red
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#d946ef", // Fuchsia
  "#8b5cf6", // Purple
  "#6366f1", // Indigo
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

    const titleRef = useRef(eventToEdit?.title || "");
    const notesRef = useRef(eventToEdit?.notes || "");
    const newTagNameRef = useRef("");
    const newTagInputRef = useRef<any>(null);
    const scrollViewRef = useRef<any>(null);

    const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
      eventToEdit?.category ?? null,
    );
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagColor, setNewTagColor] = useState(PALETTE_COLORS[0]);
    const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);

    const [selectedDay, setSelectedDay] = useState(() => {
      if (eventToEdit?.date) {
        const d = parseInt(eventToEdit.date.split("-")[2], 10);
        if (!isNaN(d)) return d;
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
      if (eventToEdit?.reminderOffset) {
        return [eventToEdit.reminderOffset];
      }
      return ["at_time"];
    });

    const is24H = useMemo(() => isDevice24Hour(), []);
    const [reminderDate, setReminderDate] = useState(() => {
      const d = new Date();
      d.setHours(7, 0, 0, 0);
      return d;
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(
      () => eventToEdit?.reminderTime || formatTimeSlot(7, 0, isDevice24Hour()),
    );

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
        setSelectedCategory(eventToEdit.category ?? null);
        setHasReminder(eventToEdit.hasReminder);

        if (eventToEdit.reminderOffsets && eventToEdit.reminderOffsets.length > 0) {
          setReminderOffsets(eventToEdit.reminderOffsets);
        } else if (eventToEdit.reminderOffset) {
          setReminderOffsets([eventToEdit.reminderOffset]);
        } else {
          setReminderOffsets(["at_time"]);
        }

        if (eventToEdit.reminderTime) {
          setSelectedTime(eventToEdit.reminderTime);
          const parts = eventToEdit.reminderTime.split(":");
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
              const d = new Date();
              d.setHours(h, m, 0, 0);
              setReminderDate(d);
            }
          }
        }

        if (eventToEdit.date) {
          const d = parseInt(eventToEdit.date.split("-")[2], 10);
          if (!isNaN(d) && d >= 1 && d <= daysInMonth) {
            setSelectedDay(d);
            const timer = setTimeout(() => scrollToSelectedDay(d, true), 100);
            return () => clearTimeout(timer);
          }
        }
      } else {
        titleRef.current = "";
        notesRef.current = "";
        setIsTitleFilled(false);
        setSelectedCategory(null);
        setHasReminder(false);
        setReminderOffsets(["at_time"]);
        setSelectedTime(formatTimeSlot(7, 0, is24H));
        const d = new Date();
        d.setHours(7, 0, 0, 0);
        setReminderDate(d);
        if (initialDay && initialDay >= 1 && initialDay <= daysInMonth) {
          setSelectedDay(initialDay);
          const timer = setTimeout(() => scrollToSelectedDay(initialDay, true), 100);
          return () => clearTimeout(timer);
        }
      }
    }, [eventToEdit, initialDay, daysInMonth, scrollToSelectedDay, is24H]);

    const daysList = useMemo(() => {
      const list: { day: number; weekdayName: string; isSunday: boolean }[] = [];
      const weekdayShortAm = ["እሁድ", "ሰኞ", "ማክሰ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
      const weekdayShortEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekdayShortOm = ["Dil", "Wix", "Kib", "Roob", "Kami", "Jim", "San"];

      for (let d = 1; d <= daysInMonth; d++) {
        let weekdayIndex = 0;
        if (isEth) {
          const gc = ethiopianToGregorian(selectedYear, selectedMonth, d);
          weekdayIndex = new Date(gc.year, gc.month, gc.day).getDay();
        } else {
          weekdayIndex = new Date(selectedYear, selectedMonth, d).getDay();
        }

        const weekdayName =
          lang === "om"
            ? weekdayShortOm[weekdayIndex]
            : lang === "en"
            ? weekdayShortEn[weekdayIndex]
            : weekdayShortAm[weekdayIndex];

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
          setSelectedCategory(null);
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
      setSelectedCategory(null);
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

    const handleSave = () => {
      const enteredTitle = titleRef.current.trim();
      if (!enteredTitle) return;

      const activeCat = selectedCategory
        ? categories.find((c) => c.id === selectedCategory)
        : null;

      onSave?.({
        id: eventToEdit ? eventToEdit.id : String(Date.now()),
        title: enteredTitle,
        category: selectedCategory ?? undefined,
        categoryColor: activeCat?.color,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`,
        hasReminder,
        reminderTime: hasReminder ? selectedTime : undefined,
        reminderOffsets: hasReminder ? reminderOffsets : undefined,
        reminderOffset: hasReminder && reminderOffsets.length > 0 ? reminderOffsets[0] : undefined,
        notes: notesRef.current.trim() || undefined,
      });

      // Clear inputs
      titleRef.current = "";
      notesRef.current = "";
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      setIsCreatingTag(false);
      setShowTimePicker(false);
      setReminderOffsets(["at_time"]);
      setSelectedCategory(null);
      setHasReminder(false);
      setIsTitleFilled(false);
      setShowDeleteEventConfirm(false);

      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
    };

    const handleCancel = () => {
      titleRef.current = "";
      notesRef.current = "";
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      setIsCreatingTag(false);
      setShowTimePicker(false);
      setReminderOffsets(["at_time"]);
      setSelectedCategory(null);
      setHasReminder(false);
      setIsTitleFilled(false);
      setShowDeleteEventConfirm(false);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
    };

    const confirmDeleteEvent = () => {
      if (eventToEdit) {
        onDeleteEvent?.(eventToEdit.id);
      }
      setShowDeleteEventConfirm(false);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
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
      const tagId = `custom_${Date.now()}`;
      const newCat: CategoryItem = {
        id: tagId,
        labelEn: enteredName,
        labelAm: enteredName,
        color: newTagColor,
        isCustom: true,
      };
      setCategories((prev) => [newCat, ...prev]);
      setSelectedCategory(tagId);
      newTagNameRef.current = "";
      newTagInputRef.current?.clear();
      setIsCreatingTag(false);
    };

    const handleDeleteCustomTag = (tagId: string) => {
      const targetTag = categories.find((c) => c.id === tagId);
      const tagName = targetTag ? getCategoryLabel(targetTag, lang) : "";
      setTagToDelete({ id: tagId, name: tagName });
    };

    const confirmDeleteTag = () => {
      if (!tagToDelete) return;
      const tagId = tagToDelete.id;
      setCategories((prev) => prev.filter((c) => c.id !== tagId));
      if (selectedCategory === tagId) {
        setSelectedCategory(null);
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
              disabled={!isTitleFilled}
              activeOpacity={0.7}
              className={`h-9 rounded-full px-4 items-center justify-center ${
                isTitleFilled
                  ? "bg-primary"
                  : "bg-stone-300/70 dark:bg-stone-800/80"
              }`}
            >
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
            style={{ fontFamily: "ReadingFont" }}
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
                style={{ fontFamily: "ReadingFont" }}
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

            {/* Existing and Custom Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory((prev) => (prev === cat.id ? null : cat.id))}
                  activeOpacity={0.7}
                  className={`h-9 mr-2 flex-row items-center gap-1.5 rounded-full border px-3.5 ${
                    isSelected
                      ? "border-primary bg-primary/15 dark:bg-primary/25"
                      : "border-stone-200/90 bg-[#F5F2EB] dark:border-stone-700/60 dark:bg-[#25221E]"
                  }`}
                >
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
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
                    {getCategoryLabel(cat, lang)}
                  </Text>

                  {cat.isCustom && (
                    <TouchableOpacity
                      onPress={() => handleDeleteCustomTag(cat.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      className="ml-0.5"
                    >
                      <Ionicons
                        name="close-circle"
                        size={14}
                        color={isDark ? "#8A8480" : "#A8A29E"}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Reminder Section (Inset-Grouped Card) */}
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
                onValueChange={setHasReminder}
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
                            {getOffsetLabel(offset, lang)}
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
            style={{ fontFamily: "ReadingFont", minHeight: 110, textAlignVertical: "top" }}
          />

          {/* Edit Mode: Delete Event Action Button */}
          {isEditMode && (
            <View className="mt-6 mb-2">
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
            </View>
          )}
        </BottomSheetScrollView>

        {/* Delete Event Confirmation Modal */}
        <Modal
          visible={showDeleteEventConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteEventConfirm(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-8">
            <View className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#1C1C1C] border border-stone-200/60 dark:border-stone-800/60 shadow-lg">
              <Text
                allowFontScaling={false}
                className="mb-2 text-xl font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("deleteEventConfirmTitle")}
              </Text>
              <Text
                allowFontScaling={false}
                className="mb-6 text-sm text-muted dark:text-muted-dark leading-relaxed"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("deleteEventConfirmDesc")}
              </Text>
              <View className="flex-row justify-end gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="rounded-xl bg-stone-100 px-5 py-2.5 dark:bg-[#2A2A2A]"
                  onPress={() => setShowDeleteEventConfirm(false)}
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
                  onPress={confirmDeleteEvent}
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
