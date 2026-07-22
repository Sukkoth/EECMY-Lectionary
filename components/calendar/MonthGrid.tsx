import { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow } from "@/lib/types";
import { HOLIDAY_COLORS } from "@/constants";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type MonthGridProps = {
  year: number;
  month: number;
  holidays: Map<string, HolidayRow[]>;
  width: number;
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

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

export default memo(function MonthGrid({
  year,
  month,
  holidays,
  width,
}: MonthGridProps) {
  const weeks = useMemo(() => getWeeks(year, month), [year, month]);
  const paddingX = 48;
  const cellWidth = Math.floor((width - paddingX) / 7);

  return (
    <View style={{ width }} className="px-6">
      {/* Sleek Modern Card Surface */}
      <View className="bg-surface dark:bg-surface-dark rounded-3xl border border-stone-200/60 dark:border-stone-800/60 p-4">
        {/* Day labels header */}
        <View className="mb-3 flex-row justify-between border-b border-stone-200/40 dark:border-stone-800/40 pb-2.5">
          {DAY_LABELS.map((label, index) => {
            const isWeekend = index === 0 || index === 6;
            return (
              <View
                key={label}
                style={{ width: cellWidth }}
                className="items-center"
              >
                <Text
                  style={{ fontFamily: "ReadingFont" }}
                  className={`text-[11px] uppercase tracking-wider font-semibold ${
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
            <View key={wi} className="flex-row justify-between py-1">
              {week.map((day, di) => {
                if (day === null) {
                  return (
                    <View key={`empty-${wi}-${di}`} style={{ width: cellWidth }} />
                  );
                }

                const dateKey = toDateKey(year, month, day);
                const dayHolidays = holidays.get(dateKey) ?? [];
                const types = [...new Set(dayHolidays.map((h) => h.type))];
                const today = isToday(year, month, day);

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={{ width: cellWidth }}
                    className="items-center justify-center py-1"
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/reading",
                        params: {
                          year,
                          month: month + 1,
                          day,
                        },
                      })
                    }
                  >
                    {/* Day number container */}
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-2xl ${
                        today ? "bg-primary" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          today
                            ? "text-white font-semibold"
                            : "text-[#2D2A24] dark:text-[#E8E4DC] font-medium"
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
