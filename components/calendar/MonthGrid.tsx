import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow, DayInfoRow } from "@/lib/types";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation, getDayLabels } from "@/lib/i18n";
import {
  getEthiopianWeeks,
  ethiopianToGregorian,
  gregorianToEthiopian,
  gregorianYmdToEthiopian,
  ETHIOPIAN_MONTH_NAMES_SHORT_AM,
  ETHIOPIAN_MONTH_NAMES_SHORT_OM,
  ETHIOPIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_AM,
  GREGORIAN_MONTH_NAMES_SHORT_OM,
} from "@/lib/ethiopianCalendar";

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<number, HolidayRow[]>;
  dayInfoMap?: Map<number, DayInfoRow>;
  width: number;
  calendarStyle?: CalendarStyle;
};

type GridCell =
  | { isNull: true; key: string }
  | {
      isNull: false;
      key: string;
      day: number;
      targetGc: { year: number; month: number; day: number };
      subLabel: string;
      showSubMonthLabel: boolean;
      today: boolean;
      types: string[];
      seasonColor?: string;
      seasonStyle?: any;
      isSunday: boolean;
    };

function getWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default memo(function MonthGrid({
  year,
  month,
  holidays,
  dayInfoMap,
  width,
  calendarStyle = "ethiopian",
}: MonthGridProps) {
  const isEth = calendarStyle === "ethiopian";
  const { settings } = useSettings();
  const { lang } = useTranslation();
  const showSeasonColors = settings.showSeasonColors ?? true;

  const resolvedEthYear = useMemo(() => {
    if (!isEth) return year;
    if (year > 2020) {
      const sampleGcDate =
        month === 12
          ? new Date(Date.UTC(year, 8, 7, 12))
          : new Date(Date.UTC(year, month, 15, 12));
      return gregorianToEthiopian(sampleGcDate).year;
    }
    return year;
  }, [isEth, year, month]);

  const weeks = useMemo(() => {
    return isEth ? getEthiopianWeeks(resolvedEthYear, month) : getWeeks(year, month);
  }, [resolvedEthYear, year, month, isEth]);

  const ethToday = useMemo(() => gregorianToEthiopian(new Date()), []);
  const gcToday = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const gcShorts = lang === "om" ? GREGORIAN_MONTH_NAMES_SHORT_OM : lang === "am" ? GREGORIAN_MONTH_NAMES_SHORT_AM : GREGORIAN_MONTH_NAMES_SHORT_EN;
  const ethShorts = lang === "om" ? ETHIOPIAN_MONTH_NAMES_SHORT_OM : lang === "en" ? ETHIOPIAN_MONTH_NAMES_SHORT_EN : ETHIOPIAN_MONTH_NAMES_SHORT_AM;

  const paddingX = 32;
  const cellWidth = Math.floor((width - paddingX) / 7);

  const gridRows = useMemo<GridCell[][]>(() => {
    return weeks.map((week, wi) => {
      return week.map((day, di) => {
        if (day === null) {
          return { isNull: true, key: `empty-${wi}-${di}` };
        }

        let targetGc = { year, month, day };
        let subDay = 0;
        let subMonthIndex = 0;
        let today = false;

        if (isEth) {
          targetGc = ethiopianToGregorian(resolvedEthYear, month, day);
          subDay = targetGc.day;
          subMonthIndex = targetGc.month;
          today =
            ethToday.year === resolvedEthYear &&
            ethToday.month === month &&
            ethToday.day === day;
        } else {
          const eth = gregorianYmdToEthiopian(year, month, day);
          subDay = eth.day;
          subMonthIndex = eth.month;
          today =
            gcToday.year === year &&
            gcToday.month === month &&
            gcToday.day === day;
        }

        const showSubMonthLabel = subDay === 1 || day === 1;
        const subAbbr = isEth ? gcShorts[subMonthIndex] : ethShorts[subMonthIndex];
        const subLabel = showSubMonthLabel ? `${subAbbr} ${subDay}` : `${subDay}`;

        const dayHolidays = holidays.get(day) ?? [];
        const types = [...new Set(dayHolidays.map((h) => h.type))];

        const dayInfo = dayInfoMap?.get(day);
        const seasonColor = dayInfo?.seasonColor?.trim();
        const isSunday = di === 0;

        let seasonStyle: any = undefined;
        if (!today && showSeasonColors && seasonColor) {
          const sc = seasonColor.trim();
          if (sc.startsWith("#") && sc.length === 7) {
            seasonStyle = {
              borderColor: `${sc}60`,
              borderWidth: 1,
              backgroundColor: "transparent",
            };
          } else {
            seasonStyle = {
              borderColor: sc,
              borderWidth: 1,
              backgroundColor: "transparent",
            };
          }
        }

        return {
          isNull: false,
          key: `day-${year}-${month}-${day}`,
          day,
          targetGc,
          subLabel,
          showSubMonthLabel,
          today,
          types,
          seasonColor,
          seasonStyle,
          isSunday,
        };
      });
    });
  }, [
    weeks,
    isEth,
    year,
    month,
    resolvedEthYear,
    ethToday,
    gcToday,
    gcShorts,
    ethShorts,
    holidays,
    dayInfoMap,
    showSeasonColors,
  ]);

  return (
    <View style={{ width }} className="px-3">
      {/* Sleek Modern Card Surface */}
      <View className="will-change-variable bg-surface dark:bg-surface-dark rounded-3xl border border-stone-200/60 dark:border-stone-800/60 p-3">
        {/* Day labels header */}
        <View className="mb-3 flex-row items-center border-b border-stone-200/40 dark:border-stone-800/40 pb-2.5">
          {getDayLabels(lang).map((label, index) => {
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
        <View className="space-y-1">
          {gridRows.map((week, wi) => (
            <View key={wi} className="flex-row items-center py-1">
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
                      style={[{ width: cellWidth - 4, height: 46 }, cell.seasonStyle]}
                      className={`items-center justify-center rounded-2xl ${
                        cell.today ? "bg-primary" : ""
                      }`}
                    >
                      <View className="flex-row items-baseline justify-center">
                        <Text
                          style={{ fontFamily: "ReadingFont" }}
                          className={`text-xl ${
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
                        <Text
                          style={{ fontFamily: "ReadingFont" }}
                          className={`ml-0.5 text-[10px] ${
                            cell.today
                              ? "text-white/90 font-semibold"
                              : cell.seasonColor
                                ? "text-muted dark:text-muted-dark font-semibold"
                                : cell.isSunday
                                  ? "text-primary/80 dark:text-blue-300 font-semibold"
                                  : cell.showSubMonthLabel
                                    ? "text-primary dark:text-blue-400 font-semibold"
                                    : "text-muted dark:text-muted-dark opacity-75 font-medium"
                          }`}
                          numberOfLines={1}
                        >
                          {cell.subLabel}
                        </Text>
                      </View>

                      {/* Event Indicator Dots */}
                      {cell.types.length > 0 && (
                        <View className="mt-1 flex-row items-center justify-center gap-1">
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
});
