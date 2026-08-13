import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow, DayInfoRow } from "@/lib/types";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import { useTranslation, getDayLabels } from "@/lib/i18n";
import {
  getEthiopianWeeks,
  ethiopianToGregorian,
  gregorianToEthiopian,
  getEcWeekNumber,
  ETHIOPIAN_MONTH_NAMES_SHORT_AM,
  ETHIOPIAN_MONTH_NAMES_SHORT_OM,
  ETHIOPIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_AM,
  GREGORIAN_MONTH_NAMES_SHORT_OM,
} from "@/lib/ethiopianCalendar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<number, HolidayRow[]>;
  dayInfoMap?: Map<number, DayInfoRow>;
  width: number;
  calendarStyle?: CalendarStyle;
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

function toDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
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
  const { lang } = useTranslation();

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
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row items-center py-1">
              {week.map((day, di) => {
                    if (day === null) {
                      return (
                        <View key={`empty-${wi}-${di}`} style={{ width: cellWidth }} />
                      );
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
                      const eth = gregorianToEthiopian(
                        new Date(Date.UTC(year, month, day, 12)),
                      );
                      subDay = eth.day;
                      subMonthIndex = eth.month;
                      today =
                        gcToday.year === year &&
                        gcToday.month === month &&
                        gcToday.day === day;
                    }

                    // Show month abbreviation on Day 1 of sub-month or on the first day of the grid card (day === 1)
                    const showSubMonthLabel = subDay === 1 || day === 1;
                    const subAbbr = isEth ? gcShorts[subMonthIndex] : ethShorts[subMonthIndex];
                    const subLabel = showSubMonthLabel
                      ? `${subAbbr} ${subDay}`
                      : `${subDay}`;

                    const dayHolidays = holidays.get(day) ?? [];
                    const types = [...new Set(dayHolidays.map((h) => h.type))];

                    const dayInfo = dayInfoMap?.get(day);
                    const seasonColor = dayInfo?.seasonColor?.trim();
                    const isSunday = di === 0;

                    const getSeasonContainerStyle = () => {
                      if (today) return undefined;
                      if (seasonColor) {
                        if (seasonColor.startsWith("#") && seasonColor.length === 7) {
                          return {
                            backgroundColor: `${seasonColor}20`,
                            borderColor: `${seasonColor}50`,
                            borderWidth: 1.5,
                          };
                        }
                        return {
                          backgroundColor: seasonColor,
                        };
                      }
                      return undefined;
                    };

                    return (
                      <TouchableOpacity
                        key={`day-${year}-${month}-${day}`}
                        style={{ width: cellWidth }}
                        className="items-center justify-center py-0.5"
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push({
                            pathname: "/reading",
                            params: {
                              year: targetGc.year,
                              month: targetGc.month + 1,
                              day: targetGc.day,
                            },
                          })
                        }
                      >
                        {/* Day number container */}
                        <View
                          style={[{ width: cellWidth - 4, height: 46 }, getSeasonContainerStyle()]}
                          className={`items-center justify-center rounded-2xl ${
                            today
                              ? "bg-primary"
                              : !seasonColor && isSunday
                                ? "bg-primary/10 border border-primary/25 dark:bg-primary/20 dark:border-primary/35"
                                : ""
                          }`}
                        >
                          <View className="flex-row items-baseline justify-center">
                            <Text
                              style={{ fontFamily: "ReadingFont" }}
                              className={`text-xl ${
                                today
                                  ? "text-white font-semibold"
                                  : seasonColor || isSunday
                                    ? "text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
                                    : "text-[#2D2A24] dark:text-[#E8E4DC] font-medium"
                              }`}
                            >
                              {day}
                            </Text>
                            <Text
                              style={{ fontFamily: "ReadingFont" }}
                              className={`ml-0.5 text-[10px] ${
                                today
                                  ? "text-white/90 font-semibold"
                                  : seasonColor || isSunday
                                    ? "text-muted dark:text-muted-dark font-semibold"
                                    : showSubMonthLabel
                                      ? "text-primary dark:text-blue-400 font-semibold"
                                      : "text-muted dark:text-muted-dark opacity-75 font-medium"
                              }`}
                              numberOfLines={1}
                            >
                              {subLabel}
                            </Text>
                          </View>
                        </View>

                        {/* Holiday dots indicator */}
                        {types.length > 0 && (
                          <View className="mt-1 flex-row gap-1">
                            {types.map((type) => (
                              <View
                                key={`holiday-${type}`}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    HOLIDAY_COLORS[type] ?? "#3b82f6",
                                }}
                              />
                            ))}
                          </View>
                        )}
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
