import React, { forwardRef, useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Switch,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
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

export type EventCategory = "church" | "choir" | "fasting" | "personal";

export type CustomEventData = {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  hasReminder: boolean;
  reminderTime: string;
  notes?: string;
};

type AddEventModalProps = {
  selectedYear: number;
  selectedMonth: number;
  isEth: boolean;
  initialDay?: number;
  onSave?: (event: CustomEventData) => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
};

const CATEGORIES: {
  id: EventCategory;
  labelEn: string;
  labelAm: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "church", labelEn: "Church", labelAm: "ቤተክርስቲያን", color: "#3b82f6", icon: "business-outline" },
  { id: "choir", labelEn: "Choir", labelAm: "ዝማሬ/መዘምራን", color: "#10b981", icon: "musical-notes-outline" },
  { id: "fasting", labelEn: "Fasting", labelAm: "ጾም", color: "#8b5cf6", icon: "flame-outline" },
  { id: "personal", labelEn: "Personal", labelAm: "የግል", color: "#f59e0b", icon: "person-outline" },
];

export const AddEventModal = forwardRef<BottomSheetModal, AddEventModalProps>(
  ({ selectedYear, selectedMonth, isEth, initialDay, onSave, onClose, onChange, onDismiss }, ref) => {
    const isDark = useIsDark();
    const { lang, t } = useTranslation();

    const titleRef = useRef("");
    const notesRef = useRef("");
    const titleInputRef = useRef<any>(null);
    const notesInputRef = useRef<any>(null);
    const scrollViewRef = useRef<any>(null);

    const [selectedDay, setSelectedDay] = useState(() => initialDay ?? 1);
    const [selectedCategory, setSelectedCategory] = useState<EventCategory>("church");
    const [hasReminder, setHasReminder] = useState(true);
    const [selectedTime, setSelectedTime] = useState("07:00 AM");

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

    useEffect(() => {
      if (initialDay && initialDay >= 1 && initialDay <= daysInMonth) {
        setSelectedDay(initialDay);
        const timer = setTimeout(() => {
          scrollToSelectedDay(initialDay, true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [initialDay, daysInMonth, scrollToSelectedDay]);

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
        if (index >= 0) {
          setTimeout(() => {
            scrollToSelectedDay(initialDay ?? 1, true);
          }, 80);
        }
      },
      [onChange, scrollToSelectedDay, initialDay],
    );

    const dateDisplay = useMemo(() => {
      const mName = formatMonth(selectedMonth, isEth, lang);
      return `${mName} ${selectedDay}, ${selectedYear}`;
    }, [selectedMonth, selectedDay, selectedYear, isEth, lang]);

    const handleSave = () => {
      const enteredTitle = titleRef.current.trim();
      if (!enteredTitle) return;

      onSave?.({
        id: String(Date.now()),
        title: enteredTitle,
        category: selectedCategory,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`,
        hasReminder,
        reminderTime: selectedTime,
        notes: notesRef.current.trim() || undefined,
      });

      // Clear inputs
      titleRef.current = "";
      notesRef.current = "";
      titleInputRef.current?.clear();
      notesInputRef.current?.clear();

      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
    };

    const handleCancel = () => {
      titleRef.current = "";
      notesRef.current = "";
      titleInputRef.current?.clear();
      notesInputRef.current?.clear();
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
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
        onDismiss={onDismiss}
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
                {lang === "am" ? "ሰርዝ" : "Cancel"}
              </Text>
            </TouchableOpacity>

            <Text
              allowFontScaling={false}
              className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {lang === "am" ? "አዲስ ክስተት" : "New Event"}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.7}
              className="bg-primary rounded-full px-4 py-1.5"
            >
              <Text
                allowFontScaling={false}
                className="text-xs font-semibold text-white"
                style={{ fontFamily: "ReadingFont" }}
              >
                {lang === "am" ? "አስቀምጥ" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Event Title Input */}
          <Text
            allowFontScaling={false}
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {lang === "am" ? "የርዕስ ስም" : "Event Title"}
          </Text>
          <BottomSheetTextInput
            ref={titleInputRef}
            defaultValue=""
            onChangeText={(text) => {
              titleRef.current = text;
            }}
            placeholder={
              lang === "am"
                ? "ምሳሌ፡ የዝማሬ ልምምድ፣ የጾም ጸሎት..."
                : "e.g. Choir Rehearsal, Prayer & Fasting..."
            }
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
            {lang === "am" ? "ቀን" : "Date"}
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
                {isEth ? "Ethiopian" : "Gregorian"}
              </Text>
            </View>
          </View>

          {/* Horizontal Day Selector Scroller */}
          <ScrollView
            ref={dayScrollRef}
            horizontal
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

          {/* Category Selector */}
          <Text
            allowFontScaling={false}
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {lang === "am" ? "ምድብ" : "Category"}
          </Text>
          <View className="mb-5 flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
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
                    {lang === "am" ? cat.labelAm : cat.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reminder Section */}
          <View className="mb-4 rounded-2xl border border-stone-200/90 bg-[#F5F2EB] p-4 dark:border-stone-700/60 dark:bg-[#25221E]">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Ionicons
                  name={hasReminder ? "notifications" : "notifications-off-outline"}
                  size={18}
                  color={hasReminder ? "#3b82f6" : "#8A8480"}
                />
                <View>
                  <Text
                    allowFontScaling={false}
                    className="text-sm font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {lang === "am" ? "ማሳሰቢያ" : "Reminder"}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    className="text-xs text-muted dark:text-muted-dark"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {lang === "am" ? "በእለቱ ጠዋት ማሳሰቢያ ይላኩ" : "Send notification on event day"}
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
              <View className="mt-3 flex-row gap-2 border-t border-stone-200/60 pt-3 dark:border-stone-700/50">
                {["07:00 AM", "08:30 AM", "06:00 PM"].map((time) => {
                  const isTimeSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      className={`rounded-xl px-3 py-1.5 ${
                        isTimeSelected
                          ? "bg-primary"
                          : "bg-white dark:bg-[#1A1815] border border-stone-200/80 dark:border-stone-700/60"
                      }`}
                    >
                      <Text
                        allowFontScaling={false}
                        className={`text-xs font-semibold ${
                          isTimeSelected
                            ? "text-white"
                            : "text-[#2D2A24] dark:text-[#E8E4DC]"
                        }`}
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Notes (Optional) */}
          <Text
            allowFontScaling={false}
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {lang === "am" ? "ማስታወሻ (አማራጭ)" : "Notes (Optional)"}
          </Text>
          <BottomSheetTextInput
            ref={notesInputRef}
            defaultValue=""
            onChangeText={(text) => {
              notesRef.current = text;
            }}
            multiline
            numberOfLines={10}
            placeholder={
              lang === "am"
                ? "ተጨማሪ ዝርዝሮች፣ ቦታ ወይም ማስታወሻ..."
                : "Location, preparation notes, or details..."
            }
            placeholderTextColor={isDark ? "#8A8480" : "#A8A29E"}
            className="rounded-2xl border border-stone-200/90 bg-[#F5F2EB] px-4 py-3.5 text-sm text-[#2D2A24] dark:border-stone-700/60 dark:bg-[#25221E] dark:text-[#F3EFE6]"
            style={{ fontFamily: "ReadingFont", minHeight: 110, textAlignVertical: "top" }}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

AddEventModal.displayName = "AddEventModal";
