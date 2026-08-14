import { useLayoutEffect, useRef, useState } from "react";
import {
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthGrid from "@/components/calendar/MonthGrid";
import {
  useHolidays,
  getHolidaysForActiveMonth,
} from "@/lib/hooks/useHolidays";
import { useDayInfo, getDayInfoForActiveMonth } from "@/lib/hooks/useDayInfo";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { HOLIDAY_COLORS } from "@/constants";
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
  const isDark = useColorScheme() === "dark";
  const { settings, updateSetting } = useSettings();
  const { t, lang } = useTranslation();
  const isEth = settings.calendarStyle === "ethiopian";

  const [current, setCurrent] = useState(() => getInitialCurrent(isEth));

  // Reset calendar view to today's date when calendar system toggles — runs
  // before paint so there's no visible flash, and avoids the double-render
  // caused by setState-during-render.
  useLayoutEffect(() => {
    setCurrent(getInitialCurrent(isEth));
  }, [isEth]);

  function addMonthDelta(delta: number) {
    setCurrent((prev) => {
      const totalMonths = isEth ? 13 : 12;
      const total = prev.month + delta;
      const newYear = prev.year + Math.floor(total / totalMonths);
      const newMonth = ((total % totalMonths) + totalMonths) % totalMonths;
      return { year: newYear, month: newMonth };
    });
  }

  function handleJumpToToday() {
    setCurrent(getInitialCurrent(isEth));
  }

  const { data: holidayIndex } = useHolidays(lang);
  const { data: dayInfoIndex } = useDayInfo(lang);

  // O(1) lookup — index was built once when query data settled
  const { map: holidayMap, list: holidays } = getHolidaysForActiveMonth(
    holidayIndex,
    current.year,
    current.month,
    isEth,
    lang,
  );
  const dayInfoMap = getDayInfoForActiveMonth(dayInfoIndex, current.year, current.month, isEth);

  // Keep addMonthDelta stable across renders so the one-time PanResponder
  // always calls the latest version without being recreated.
  const addMonthDeltaRef = useRef(addMonthDelta);
  addMonthDeltaRef.current = addMonthDelta;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) > 50) {
          addMonthDeltaRef.current(gs.dx > 0 ? -1 : 1);
        }
      },
    }),
  ).current;

  const ethToday = gregorianToEthiopian(today);
  const isCurrentTodayMonth = isEth
    ? current.year === ethToday.year && current.month === ethToday.month
    : current.year === today.getFullYear() && current.month === today.getMonth();

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
        <View>
          <Text
            className="text-3xl font-semibold tracking-tight text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont" }}
          >
            {formatMonth(current.month, isEth, lang)}
          </Text>
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
              onPress={() => addMonthDelta(-1)}
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
              onPress={() => addMonthDelta(1)}
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
      <View className="mb-3 flex-row items-center justify-between px-6">
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

      {/* Swipeable Month Grid */}
      <View {...panResponder.panHandlers}>
        <MonthGrid
          year={current.year}
          month={current.month}
          holidays={holidayMap}
          dayInfoMap={dayInfoMap}
          width={screenWidth}
          calendarStyle={settings.calendarStyle}
          showSeasonColors={settings.showSeasonColors ?? true}
        />
      </View>

      {/* Section Divider */}
      <View className="mx-6 my-4 border-b border-stone-200/50 dark:border-stone-800/50" />

      {/* Holidays List */}
      <View className="flex-1 px-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="text-muted dark:text-muted-dark text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("holidaysAndEvents")}
          </Text>
          <View className="bg-primary/10 rounded-full px-2.5 py-0.5">
            <Text
              className="text-primary text-[11px] font-semibold"
              style={{ fontFamily: "ReadingFont" }}
            >
              {holidays.length} {holidays.length === 1 ? t("event") : t("events")}
            </Text>
          </View>
        </View>

        {holidays.length === 0 ? (
          <View className="will-change-variable bg-surface dark:bg-surface-dark my-2 items-center justify-center rounded-2xl border border-stone-200/40 p-6 dark:border-stone-800/40">
            <Ionicons name="sparkles-outline" size={22} color="#6b6560" />
            <Text
              className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {t("noHolidaysThisMonth")}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            {holidays.map((item, i) => {
              const monthShort = item.displayMonthName;
              const dayNum = item.displayDay;
              const key = item.id ?? `${item.date}-${item.name}-${i}`;
              return (
                <View
                  key={key}
                  className="will-change-variable bg-surface dark:bg-surface-dark my-1.5 flex-row items-center justify-between rounded-2xl border border-stone-200/50 p-4 dark:border-stone-800/50"
                >
                  {/* Left Color Accent Bar */}
                  <View
                    className="mr-3.5 h-10 w-1.5 rounded-full"
                    style={{
                      backgroundColor: HOLIDAY_COLORS[item.type] ?? "#3b82f6",
                    }}
                  />

                  {/* Feast Info */}
                  <View className="flex-1">
                    <Text
                      className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.name}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <Text
                        className="text-primary text-xs font-semibold uppercase tracking-wider"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {monthShort} {dayNum}
                      </Text>
                      <Text className="text-muted dark:text-muted-dark text-xs">
                        •
                      </Text>
                      <Text
                        className="text-muted dark:text-muted-dark text-xs font-medium capitalize"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {item.type}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
