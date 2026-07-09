import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { HolidayRow } from "@/lib/types";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const HOLIDAY_COLORS: Record<string, string> = {
  eecmy: "#B45309",
  christian: "#2563EB",
  others: "#16A34A",
};

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

export default function MonthGrid({ year, month, holidays, width }: MonthGridProps) {
  const weeks = useMemo(() => getWeeks(year, month), [year, month]);
  const cellWidth = Math.floor(width / 7);

  return (
    <View style={{ width }} className="px-4">
      {/* Day labels row */}
      <View className="mb-2 flex-row">
        {DAY_LABELS.map((label, index) => (
          <View key={index} style={{ width: cellWidth }} className="items-center">
            <Text style={{
              fontFamily: "ReadingFont"
            }} className="text-muted dark:text-muted-dark text-md font-bold">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row">
          {week.map((day, di) => {
            if (day === null) {
              return <View key={`empty-${wi}-${di}`} style={{ width: cellWidth }} />;
            }

            const dateKey = toDateKey(year, month, day);
            const dayHolidays = holidays.get(dateKey) ?? [];
            const types = [...new Set(dayHolidays.map((h) => h.type))];
            const today = isToday(year, month, day);

            return (
              <TouchableOpacity
                key={dateKey}
                style={{ width: cellWidth }}
                className="items-center py-1.5"
                activeOpacity={0.6}
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
                {/* Day number */}
                {today ? (
                  <View className="bg-primary h-8 w-8 items-center justify-center rounded-full">
                    <Text
                      className="text-xl font-semibold text-white"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {day}
                    </Text>
                  </View>
                ) : (
                  <View className="h-8 w-8 items-center justify-center">
                    <Text
                      className="text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {day}
                    </Text>
                  </View>
                )}

                {/* Holiday dots */}
                {types.length > 0 && (
                  <View className="mt-0.5 flex-row gap-1">
                    {types.map((type) => (
                      <View
                        key={type}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: HOLIDAY_COLORS[type] ?? "#9CA3AF" }}
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
  );
}
