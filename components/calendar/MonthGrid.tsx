import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow } from "@/lib/types";
import { HOLIDAY_COLORS } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import {
  getEthiopianWeeks,
  ethiopianToGregorian,
  gregorianToEthiopian,
  getEcWeekNumber,
} from "@/lib/ethiopianCalendar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<number, HolidayRow[]>;
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
  width,
  calendarStyle = "ethiopian",
}: MonthGridProps) {
  const isEth = calendarStyle === "ethiopian";
  const weeks = useMemo(() => {
    return isEth ? getEthiopianWeeks(year, month) : getWeeks(year, month);
  }, [year, month, isEth]);

  const ethToday = useMemo(() => gregorianToEthiopian(new Date()), []);
  const gcToday = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const paddingX = 48;
  const cellWidth = Math.floor((width - paddingX) / 7);

  return (
    <View style={{ width }} className="px-6">
      {/* Sleek Modern Card Surface */}
      <View className="will-change-variable bg-surface dark:bg-surface-dark rounded-3xl border border-stone-200/60 dark:border-stone-800/60 p-4">
        {/* Day labels header */}
        <View className="mb-3 flex-row items-center border-b border-stone-200/40 dark:border-stone-800/40 pb-2.5">
          {DAY_LABELS.map((label, index) => {
            const isWeekend = index === 0 || index === 6;
            return (
              <View
                key={label}
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
                    let today = false;

                    if (isEth) {
                      targetGc = ethiopianToGregorian(year, month, day);
                      today =
                        ethToday.year === year &&
                        ethToday.month === month &&
                        ethToday.day === day;
                    } else {
                      today =
                        gcToday.year === year &&
                        gcToday.month === month &&
                        gcToday.day === day;
                    }

                    const dayHolidays = holidays.get(day) ?? [];
                    const types = [...new Set(dayHolidays.map((h) => h.type))];

                    return (
                      <TouchableOpacity
                        key={`day-${year}-${month}-${day}`}
                        style={{ width: cellWidth }}
                        className="items-center justify-center py-1"
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
                          className={`h-10 w-10 items-center justify-center rounded-2xl ${
                            today ? "bg-primary" : ""
                          }`}
                        >
                          <Text
                            className={`text-xl ${
                              today
                                ? "text-white font-bold"
                                : "text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
                            }`}
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {day}
                          </Text>
                        </View>

                        {/* Holiday dots indicator */}
                        {types.length > 0 && (
                          <View className="mt-1 flex-row gap-1">
                            {types.map((type) => (
                              <View
                                key={type}
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
