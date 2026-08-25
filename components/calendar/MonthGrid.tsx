import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow, DayInfoRow } from "@/lib/types";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import { useTranslation, getDayLabels } from "@/lib/i18n";
import {
  getEthiopianWeeks,
  gregorianToEthiopian,
} from "@/lib/ethiopianCalendar";
import {
  buildMonthGridMatrix,
  getGregorianWeeks,
  getMonthShortNames,
} from "@/lib/calendarGridHelpers";

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<number, HolidayRow[]>;
  dayInfoMap?: Map<number, DayInfoRow>;
  width: number;
  calendarStyle?: CalendarStyle;
  showSeasonColors?: boolean;
};

/**
 * Renders a monthly calendar grid with dual-calendar sub-labels,
 * holiday event indicators, and liturgical season highlights.
 */
function MonthGridComponent({
  year,
  month,
  holidays,
  dayInfoMap,
  width,
  calendarStyle = "ethiopian",
  showSeasonColors = true,
}: MonthGridProps) {
  const isEth = calendarStyle === "ethiopian";
  const { lang } = useTranslation();

  const dayLabels = useMemo(() => getDayLabels(lang), [lang]);
  const monthShorts = useMemo(() => getMonthShortNames(lang), [lang]);

  const paddingX = 32;
  const cellWidth = Math.floor((width - paddingX) / 7);

  const gridRows = useMemo(() => {
    const weeks = isEth ? getEthiopianWeeks(year, month) : getGregorianWeeks(year, month);
    const ethToday = gregorianToEthiopian(new Date());
    const d = new Date();
    const gcToday = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };

    return buildMonthGridMatrix({
      weeks,
      year,
      month,
      isEth,
      ethToday,
      gcToday,
      gcShorts: monthShorts.gcShorts,
      ethShorts: monthShorts.ethShorts,
      holidays,
      dayInfoMap,
      showSeasonColors,
    });
  }, [year, month, isEth, monthShorts, holidays, dayInfoMap, showSeasonColors]);

  return (
    <View style={{ width }} className="px-3">
      {/* Sleek Modern Card Surface */}
      <View className="will-change-variable bg-surface dark:bg-surface-dark rounded-3xl border border-stone-200/60 dark:border-stone-800/60 p-3">
        {/* Day labels header */}
        <View className="mb-2 flex-row items-center border-b border-stone-200/40 dark:border-stone-800/40 pb-2">
          {dayLabels.map((label, index) => {
            const isWeekend = index === 0 || index === 6;
            return (
              <View
                key={`header-day-${index}`}
                style={{ width: cellWidth }}
                className="items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "ReadingFont" }}
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isWeekend
                      ? "text-primary/70"
                      : "text-muted dark:text-muted-dark opacity-80"
                  }`}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Week rows */}
        <View className="space-y-0.5">
          {gridRows.map((week, wi) => (
            <View key={wi} className="flex-row items-center py-0.5">
              {week.map((cell) => {
                if (cell.isNull) {
                  return (
                    <View key={cell.key} style={{ width: cellWidth }} />
                  );
                }

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={{ width: cellWidth }}
                    className="items-center justify-center py-0.5"
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/reading",
                        params: {
                          year: cell.targetGc.year,
                          month: cell.targetGc.month + 1,
                          day: cell.targetGc.day,
                        },
                      })
                    }
                  >
                    {/* Day number container */}
                    <View
                      style={[{ width: cellWidth - 4, height: 44, position: "relative" }, cell.seasonStyle]}
                      className={`items-center justify-center rounded-2xl ${
                        cell.today ? "bg-primary" : ""
                      }`}
                    >
                      {/* Secondary reference micro-date in top right corner */}
                      {cell.subLabel ? (
                        <Text
                          style={{ fontFamily: "ReadingFont" }}
                          className={`absolute top-1 right-1.5 text-[9px] ${
                            cell.today
                              ? "text-white/80 font-medium"
                              : cell.seasonColor
                                ? "text-muted dark:text-muted-dark font-medium"
                                : cell.isSunday
                                  ? "text-primary/70 dark:text-blue-300 font-medium"
                                  : cell.showSubMonthLabel
                                    ? "text-primary dark:text-blue-400 font-semibold"
                                    : "text-muted dark:text-muted-dark opacity-60 font-normal"
                          }`}
                          numberOfLines={1}
                        >
                          {cell.subLabel}
                        </Text>
                      ) : null}

                      {/* Main Primary Day Number Centered */}
                      <Text
                        style={{ fontFamily: "ReadingFont" }}
                        className={`text-lg ${
                          cell.today
                            ? "text-white font-semibold"
                            : cell.seasonColor
                              ? "text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
                              : cell.isSunday
                                ? "text-primary dark:text-blue-400 font-semibold"
                                : "text-[#2D2A24] dark:text-[#E8E4DC] font-medium"
                        }`}
                      >
                        {cell.day}
                      </Text>

                      {/* Event Indicator Dots */}
                      {cell.types.length > 0 && (
                        <View className="absolute bottom-1 flex-row items-center justify-center gap-1">
                          {cell.types.map((type, i) => (
                            <View
                              key={i}
                              style={{
                                backgroundColor: cell.today
                                  ? "#ffffff"
                                  : (HOLIDAY_COLORS as Record<string, string>)[type] || "#3b82f6",
                              }}
                              className="h-1 w-1 rounded-full"
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default React.memo(MonthGridComponent);
