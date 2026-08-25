import { useLayoutEffect, useRef, useState } from "react";
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
import {
  gregorianToEthiopian,
  formatEvangelistYear,
  getSubMonthSpanString,
  formatMonth,
} from "@/lib/ethiopianCalendar";

function formatYear(year: number, month: number, isEth: boolean, lang: string = "am"): string {
  const targetEthYear = isEth ? year : gregorianToEthiopian(new Date(year, month, 15)).year;
  const evText = formatEvangelistYear(targetEthYear, lang);
  return `${year} • ${evText}`;
}

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
  const swiperRef = useRef<CalendarSwiperRef>(null);

  // Reset calendar view to today's date when calendar system toggles — runs
  // before paint so there's no visible flash, and avoids the double-render
  // caused by setState-during-render.
  useLayoutEffect(() => {
    setCurrent(getInitialCurrent(isEth));
  }, [isEth]);

  function handleJumpToToday() {
    setCurrent(getInitialCurrent(isEth));
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
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-11 pb-3">
        <TouchableOpacity
          onPress={() => pickerSheetRef.current?.present()}
          activeOpacity={0.7}
          className="flex-row items-center gap-2"
        >
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text
                className="text-3xl font-semibold tracking-tight text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                {formatMonth(current.month, isEth, lang)}
              </Text>
              <Ionicons
                name="chevron-down"
                size={22}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </View>
            <Text
              className="text-primary mt-1 text-sm font-semibold uppercase tracking-wide"
              style={{ fontFamily: "ReadingFont" }}
            >
              {formatYear(current.year, current.month, isEth, lang)}
            </Text>
            <Text
              className="text-muted dark:text-muted-dark mt-0.5 text-xs font-medium"
              style={{ fontFamily: "ReadingFont" }}
            >
              {getSubMonthSpanString(current.year, current.month, isEth, lang)}
            </Text>
          </View>
        </TouchableOpacity>

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

      {/* Calendar System Segmented Bar */}
      <View className="mb-2.5 flex-row items-center justify-between px-6">
        <Text
          className="text-muted dark:text-muted-dark text-xs font-semibold uppercase tracking-wider"
          style={{ fontFamily: "ReadingFont" }}
        >
          {t("calendarSystem")}
        </Text>

        <View className="bg-stone-200/60 dark:bg-stone-800/60 flex-row items-center rounded-full p-0.5 border border-stone-200/60 dark:border-stone-800/60">
          <TouchableOpacity
            onPress={() => updateSetting("calendarStyle", "ethiopian")}
            activeOpacity={0.7}
            className={`rounded-full px-3 py-1 ${isEth ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-xs font-semibold ${isEth ? "text-white" : "text-muted dark:text-muted-dark"}`}
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("ethiopianEC")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateSetting("calendarStyle", "gregorian")}
            activeOpacity={0.7}
            className={`rounded-full px-3 py-1 ${!isEth ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-xs font-semibold ${!isEth ? "text-white" : "text-muted dark:text-muted-dark"}`}
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("gregorianGC")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipeable Calendar & Holidays Container */}
      <CalendarSwiper
        ref={swiperRef}
        current={current}
        isEth={isEth}
        holidayIndex={holidayIndex}
        dayInfoIndex={dayInfoIndex}
        screenWidth={screenWidth}
        calendarStyle={settings.calendarStyle}
        showSeasonColors={settings.showSeasonColors ?? true}
        onMonthChange={(year, month) => {
          setCurrent({ year, month });
        }}
      />

      <MonthYearPickerModal
        ref={pickerSheetRef}
        selectedYear={current.year}
        selectedMonth={current.month}
        isEth={isEth}
        onSelect={(y, m) => {
          setCurrent({ year: y, month: m });
        }}
      />
    </SafeAreaView>
  );
}
