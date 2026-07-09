import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MonthGrid from "@/components/calendar/MonthGrid";
import {
  getHolidaysForMonth,
  getHolidaysListForMonth,
} from "@/lib/HolidayCache";

const HOLIDAY_COLORS: Record<string, string> = {
  eecmy: "#B45309",
  christian: "#2563EB",
  others: "#16A34A",
};

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const date = new Date(2000, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = month + delta;
  const newYear = year + Math.floor(total / 12);
  const newMonth = ((total % 12) + 12) % 12;
  return { year: newYear, month: newMonth };
}

export default function CalendarScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const isDark = useColorScheme() === "dark";

  const [current, setCurrent] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  // ── Data from cache (synchronous) ──
  const holidayMap = useMemo(
    () => getHolidaysForMonth(current.year, current.month),
    [current],
  );
  const holidays = useMemo(
    () => getHolidaysListForMonth(current.year, current.month),
    [current],
  );

  // ── PanResponder for swipe ──
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) > 50) {
          setCurrent((prev) => addMonths(prev.year, prev.month, gs.dx > 0 ? 1 : -1));
        }
      },
    })
  ).current;

  return (
    <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark" {...panResponder.panHandlers}>
      {/* Header with nav buttons */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, -1))}
          className="p-2"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={isDark ? "#E8E4DC" : "#2D2A24"} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {formatMonthYear(current.year, current.month)}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, 1))}
          className="p-2"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color={isDark ? "#E8E4DC" : "#2D2A24"} />
        </TouchableOpacity>
      </View>

      {/* Month grid — single instance, data replaced on swipe */}
      <View>
        <MonthGrid
          year={current.year}
          month={current.month}
          holidays={holidayMap}
          width={screenWidth}
        />
      </View>

      {/* Divider */}
      <View className="mx-6 border-b border-stone-200 dark:border-stone-800" />

      {/* Holiday list */}
      <View className="flex-1 px-6 pt-4">
        <Text
          className="text-muted dark:text-muted-dark mb-3 text-sm uppercase tracking-widest"
          style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
        >
          Holidays
        </Text>
        {holidays.length === 0 ? (
          <Text
            className="text-muted dark:text-muted-dark text-base"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            No holidays this month
          </Text>
        ) : (
          <ScrollView className="flex-1">
            {holidays.map((item, i) => (
              <View key={i} className="flex-row items-start py-2">
                <Text
                  className="text-muted dark:text-muted-dark w-16 text-base"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {formatShortDate(item.date)}
                </Text>
                <View className="ml-2 flex-1">
                  <Text
                    className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {item.name}
                  </Text>
                  <View className="mt-0.5 flex-row items-center gap-1.5">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          HOLIDAY_COLORS[item.type] ?? "#9CA3AF",
                      }}
                    />
                    <Text
                      className="text-muted dark:text-muted-dark text-sm capitalize"
                      style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                    >
                      {item.type}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
