import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthGrid from "@/components/calendar/MonthGrid";
import type { HolidayIndex } from "@/lib/hooks/useHolidays";
import { getHolidaysForActiveMonth } from "@/lib/hooks/useHolidays";
import type { DayInfoIndex } from "@/lib/hooks/useDayInfo";
import { getDayInfoForActiveMonth } from "@/lib/hooks/useDayInfo";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import {
  formatMonth,
  formatEvangelistYear,
  getSubMonthSpanString,
  gregorianToEthiopian,
} from "@/lib/ethiopianCalendar";

function formatYear(year: number, month: number, isEth: boolean, lang: string = "am"): string {
  const targetEthYear = isEth ? year : gregorianToEthiopian(new Date(year, month, 15)).year;
  const evText = formatEvangelistYear(targetEthYear, lang);
  return `${year} • ${evText}`;
}

type MonthPageProps = {
  year: number;
  month: number;
  isEth: boolean;
  holidayIndex?: HolidayIndex;
  dayInfoIndex?: DayInfoIndex;
  screenWidth: number;
  calendarStyle: CalendarStyle;
  showSeasonColors: boolean;
  onOpenPicker?: (year: number, month: number) => void;
};

export const MonthPage = React.memo(function MonthPage({
  year,
  month,
  isEth,
  holidayIndex,
  dayInfoIndex,
  screenWidth,
  calendarStyle,
  showSeasonColors,
  onOpenPicker,
}: MonthPageProps) {
  const { t, lang } = useTranslation();
  const isDark = useIsDark();

  // O(1) lookup from pre-indexed data structures
  const { holidayMap, holidays } = useMemo(() => {
    const { map, list } = getHolidaysForActiveMonth(
      holidayIndex,
      year,
      month,
      isEth,
      lang,
    );
    return { holidayMap: map, holidays: list };
  }, [holidayIndex, year, month, isEth, lang]);

  const dayInfoMap = useMemo(() => {
    return getDayInfoForActiveMonth(dayInfoIndex, year, month, isEth);
  }, [dayInfoIndex, year, month, isEth]);

  const monthTitle = useMemo(() => formatMonth(month, isEth, lang), [month, isEth, lang]);
  const yearSubtitle = useMemo(() => formatYear(year, month, isEth, lang), [year, month, isEth, lang]);
  const subSpan = useMemo(() => getSubMonthSpanString(year, month, isEth, lang), [year, month, isEth, lang]);

  return (
    <View className="flex-1">
      {/* Month Title & Sub-Info Header (moves smoothly with animation) */}
      <View className="px-6 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => onOpenPicker?.(year, month)}
          activeOpacity={0.7}
          className="self-start"
        >
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-3xl font-semibold tracking-tight text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {monthTitle}
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
            {yearSubtitle}
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-0.5 text-xs font-medium"
            style={{ fontFamily: "ReadingFont" }}
          >
            {subSpan}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month Grid */}
      <MonthGrid
        year={year}
        month={month}
        holidays={holidayMap}
        dayInfoMap={dayInfoMap}
        width={screenWidth}
        calendarStyle={calendarStyle}
        showSeasonColors={showSeasonColors}
      />

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
              const isSpan =
                item.displayEndDay && item.displayEndDay !== item.displayDay;
              const dayText = isSpan
                ? `${item.displayDay}–${item.displayEndDay}`
                : `${item.displayDay}`;

              const themeColor = HOLIDAY_COLORS[item.type] ?? "#3b82f6";
              const key = item.id ?? `${item.date}-${item.name}-${i}`;

              return (
                <View
                  key={key}
                  className="will-change-variable bg-surface dark:bg-surface-dark my-1.5 flex-row items-center justify-between rounded-2xl border border-stone-200/50 p-4 dark:border-stone-800/50"
                >
                  {/* Left: Accent Line + Feast Info */}
                  <View className="flex-1 flex-row items-center gap-3 pr-3">
                    <View
                      className="h-10 w-1.5 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                    <View className="flex-1">
                      <Text
                        className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-muted dark:text-muted-dark text-xs font-medium capitalize mt-0.5"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {item.type}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Large Unboxed Date Number */}
                  <Text
                    className="text-2xl font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{
                      fontFamily: "ReadingFont",
                      fontWeight: "600",
                    }}
                  >
                    {dayText}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
});
