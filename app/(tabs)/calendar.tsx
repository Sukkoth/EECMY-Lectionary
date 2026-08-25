import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthYearPickerModal from "@/components/calendar/MonthYearPickerModal";
import {
  CalendarSwiper,
  type CalendarSwiperRef,
} from "@/components/calendar/CalendarSwiper";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHolidays } from "@/lib/hooks/useHolidays";
import { useDayInfo } from "@/lib/hooks/useDayInfo";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { gregorianToEthiopian } from "@/lib/ethiopianCalendar";

function getInitialCurrent(isEth: boolean) {
  const now = new Date();
  if (isEth) {
    const eth = gregorianToEthiopian(now);
    return { year: eth.year, month: eth.month };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default function CalendarScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const today = new Date();
  const isDark = useIsDark();
  const { settings, updateSetting } = useSettings();
  const { t, lang } = useTranslation();
  const isEth = settings.calendarStyle === "ethiopian";

  const [current, setCurrent] = useState(() => getInitialCurrent(isEth));
  const [pickerSelected, setPickerSelected] = useState(() => getInitialCurrent(isEth));
  const swiperRef = useRef<CalendarSwiperRef>(null);

  function handleToggleCalendarStyle(newStyle: "ethiopian" | "gregorian") {
    if (newStyle === settings.calendarStyle) return;
    const newIsEth = newStyle === "ethiopian";
    const initial = getInitialCurrent(newIsEth);
    setCurrent(initial);
    setPickerSelected(initial);
    updateSetting("calendarStyle", newStyle);
    swiperRef.current?.jumpTo(initial);
  }

  function handleJumpToToday() {
    const initial = getInitialCurrent(isEth);
    setCurrent(initial);
    setPickerSelected(initial);
    swiperRef.current?.jumpTo(initial);
  }

  function handleOpenPicker(year: number, month: number) {
    setPickerSelected({ year, month });
    pickerSheetRef.current?.present();
  }

  const { data: holidayIndex } = useHolidays(lang, settings.language);
  const { data: dayInfoIndex } = useDayInfo(lang, settings.language);

  const pickerSheetRef = useRef<BottomSheetModal>(null);

  const ethToday = gregorianToEthiopian(today);
  const isCurrentTodayMonth = isEth
    ? current.year === ethToday.year && current.month === ethToday.month
    : current.year === today.getFullYear() && current.month === today.getMonth();

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Top Fixed Control Bar */}
      <View className="flex-row items-center justify-between px-6 pt-11 pb-2">
        {/* Left: Calendar System Segmented Toggle */}
        <View className="bg-stone-200/60 dark:bg-stone-800/60 flex-row items-center rounded-full p-0.5 border border-stone-200/60 dark:border-stone-800/60">
          <TouchableOpacity
            onPress={() => handleToggleCalendarStyle("ethiopian")}
            activeOpacity={0.7}
            className={`rounded-full px-3 py-1.5 ${isEth ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-xs font-semibold ${isEth ? "text-white" : "text-muted dark:text-muted-dark"}`}
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("ethiopianEC")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleToggleCalendarStyle("gregorian")}
            activeOpacity={0.7}
            className={`rounded-full px-3 py-1.5 ${!isEth ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-xs font-semibold ${!isEth ? "text-white" : "text-muted dark:text-muted-dark"}`}
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("gregorianGC")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: Today Button + Chevron Controls */}
        <View className="flex-row items-center gap-2">
          {!isCurrentTodayMonth && (
            <TouchableOpacity
              onPress={handleJumpToToday}
              activeOpacity={0.75}
              className="bg-primary/10 flex-row items-center gap-1 rounded-full px-3 py-1.5"
            >
              <Ionicons name="today-outline" size={14} color="#3b82f6" />
              <Text
                className="text-primary text-xs font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("today")}
              </Text>
            </TouchableOpacity>
          )}

          {/* Capsule Chevron Controls */}
          <View className="will-change-variable bg-surface dark:bg-surface-dark flex-row items-center rounded-2xl border border-stone-200/60 p-1 dark:border-stone-800/60">
            <TouchableOpacity
              onPress={() => swiperRef.current?.goToPrev()}
              className="p-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
            <View className="mx-0.5 my-auto h-4 w-[1px] bg-stone-200 dark:bg-stone-800" />
            <TouchableOpacity
              onPress={() => swiperRef.current?.goToNext()}
              className="p-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Swipeable Calendar (Month Header + Grid + Holidays List move together) */}
      <CalendarSwiper
        ref={swiperRef}
        initialDate={current}
        isEth={isEth}
        holidayIndex={holidayIndex}
        dayInfoIndex={dayInfoIndex}
        screenWidth={screenWidth}
        calendarStyle={settings.calendarStyle}
        showSeasonColors={settings.showSeasonColors ?? true}
        onMonthChange={(year, month) => {
          setCurrent({ year, month });
        }}
        onOpenPicker={handleOpenPicker}
      />

      <MonthYearPickerModal
        ref={pickerSheetRef}
        selectedYear={pickerSelected.year}
        selectedMonth={pickerSelected.month}
        isEth={isEth}
        onSelect={(y, m) => {
          const target = { year: y, month: m };
          setCurrent(target);
          setPickerSelected(target);
          swiperRef.current?.jumpTo(target);
        }}
      />
    </SafeAreaView>
  );
}
