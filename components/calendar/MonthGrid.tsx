import React, { useMemo } from "react";
import { Text, Pressable, View } from "react-native";
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
  type GridCell,
} from "@/lib/calendarGridHelpers";

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<number, HolidayRow[]>;
  customEvents?: Map<number, string[]>;
  dayInfoMap?: Map<number, DayInfoRow>;
  width: number;
  calendarStyle?: CalendarStyle;
  showSeasonColors?: boolean;
  onLongPressDay?: (day: number) => void;
};

// Hoisted static style for the dot indicator
const DOT_WHITE_BG = { backgroundColor: "#ffffff" };

type DayCellProps = {
  cell: Extract<GridCell, { isNull: false }>;
  cellWidth: number;
  onLongPressDay?: (day: number) => void;
};

/**
 * Memoized individual day cell — prevents re-rendering all 42 cells
 * when only a few props change (rerender-memo).
 */
const DayCell = React.memo(function DayCell({
  cell,
  cellWidth,
  onLongPressDay,
}: DayCellProps) {
  const cellContainerStyle = useMemo(
    () => [
      {
        width: cellWidth - 4,
        height: 44,
        position: "relative" as const,
        borderRadius: 16,
      },
      cell.seasonStyle,
    ],
    [cellWidth, cell.seasonStyle],
  );

  return (
    <Pressable
      style={{ width: cellWidth }}
      className="items-center justify-center py-0.5"
      delayLongPress={350}
      onLongPress={() => {
        if (cell.day) {
          onLongPressDay?.(cell.day);
        }
      }}
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
        style={cellContainerStyle}
        className={`items-center justify-center rounded-2xl ${
          cell.today ? "bg-primary" : ""
        }`}
      >
        {/* Secondary reference micro-date in top right corner */}
        {cell.subLabel ? (
          <Text
            allowFontScaling={false}
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
          allowFontScaling={false}
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
        {cell.dotColors && cell.dotColors.length > 0 && (
          <View className="absolute bottom-1 flex-row items-center justify-center gap-1">
            {cell.dotColors.slice(0, 3).map((color, i) => (
              <View
                key={i}
                style={
                  cell.today
                    ? DOT_WHITE_BG
                    : { backgroundColor: color }
                }
                className="h-1 w-1 rounded-full"
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
});

/**
 * Renders a monthly calendar grid with dual-calendar sub-labels,
 * holiday event indicators, and liturgical season highlights.
 */
function MonthGridComponent({
  year,
  month,
  holidays,
  customEvents,
  dayInfoMap,
  width,
  calendarStyle = "ethiopian",
  showSeasonColors = true,
  onLongPressDay,
}: MonthGridProps) {
  const isEth = calendarStyle === "ethiopian";
  const { lang } = useTranslation();

  const dayLabels = useMemo(() => getDayLabels(lang), [lang]);
  const monthShorts = useMemo(() => getMonthShortNames(lang), [lang]);

  const paddingX = 32;
  const cellWidth = Math.floor((width - paddingX) / 7);

  const gridRows = useMemo(() => {
    const weeks = isEth ? getEthiopianWeeks(year, month) : getGregorianWeeks(year, month);
    const now = new Date();
    const ethToday = gregorianToEthiopian(now);
    const gcToday = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

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
      customEvents,
      dayInfoMap,
      showSeasonColors,
    });
  }, [year, month, isEth, monthShorts, holidays, customEvents, dayInfoMap, showSeasonColors]);

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
                  allowFontScaling={false}
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
                  <DayCell
                    key={cell.key}
                    cell={cell}
                    cellWidth={cellWidth}
                    onLongPressDay={onLongPressDay}
                  />
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
