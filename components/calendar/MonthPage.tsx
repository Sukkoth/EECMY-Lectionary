import React from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthGrid from "@/components/calendar/MonthGrid";
import type { HolidayIndex } from "@/lib/hooks/useHolidays";
import { getHolidaysForActiveMonth } from "@/lib/hooks/useHolidays";
import type { DayInfoIndex } from "@/lib/hooks/useDayInfo";
import { getDayInfoForActiveMonth } from "@/lib/hooks/useDayInfo";
import { useTranslation } from "@/lib/i18n";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";

type MonthPageProps = {
  year: number;
  month: number;
  isEth: boolean;
  holidayIndex?: HolidayIndex;
  dayInfoIndex?: DayInfoIndex;
  screenWidth: number;
  calendarStyle: CalendarStyle;
  showSeasonColors: boolean;
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
}: MonthPageProps) {
  const { t, lang } = useTranslation();

  // O(1) lookup from the pre-indexed data structures
  const { map: holidayMap, list: holidays } = getHolidaysForActiveMonth(
    holidayIndex,
    year,
    month,
    isEth,
    lang,
  );
  const dayInfoMap = getDayInfoForActiveMonth(dayInfoIndex, year, month, isEth);

  return (
    <View className="flex-1">
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
