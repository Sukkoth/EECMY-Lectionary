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
  useHolidays,
  getHolidaysForMonth,
  getHolidaysListForMonth,
} from "@/lib/hooks/useHolidays";
import { useSettings } from "@/lib/SettingsContext";
import { HOLIDAY_COLORS } from "@/constants";

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
  const { settings } = useSettings();

  const [current, setCurrent] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const { data: allHolidays } = useHolidays(settings.language);

  const holidayMap = useMemo(
    () => getHolidaysForMonth(allHolidays, current.year, current.month),
    [allHolidays, current],
  );
  const holidays = useMemo(
    () => getHolidaysListForMonth(allHolidays, current.year, current.month),
    [allHolidays, current],
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) > 50) {
          setCurrent((prev) => addMonths(prev.year, prev.month, gs.dx > 0 ? -1 : 1));
        }
      },
    })
  ).current;

  return (
    <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, -1))}
          className="bg-surface dark:bg-surface-dark border border-stone-200/60 dark:border-stone-800/60 rounded-full p-2.5 shadow-sm"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={18} color={isDark ? "#E8E4DC" : "#2D2A24"} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {formatMonthYear(current.year, current.month)}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, 1))}
          className="bg-surface dark:bg-surface-dark border border-stone-200/60 dark:border-stone-800/60 rounded-full p-2.5 shadow-sm"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={18} color={isDark ? "#E8E4DC" : "#2D2A24"} />
        </TouchableOpacity>
      </View>

      <View {...panResponder.panHandlers}>
        <MonthGrid
          year={current.year}
          month={current.month}
          holidays={holidayMap}
          width={screenWidth}
        />
      </View>

      <View className="mx-6 my-4 border-b border-stone-200/60 dark:border-stone-800/60" />

      <View className="flex-1 px-6 pt-1">
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="text-muted dark:text-muted-dark text-xs uppercase tracking-widest font-semibold"
            style={{ fontFamily: "ReadingFont" }}
          >
            Holidays & Feasts
          </Text>
          <Text
            className="text-xs text-primary font-medium"
            style={{ fontFamily: "ReadingFont" }}
          >
            {holidays.length} {holidays.length === 1 ? "event" : "events"}
          </Text>
        </View>
        {holidays.length === 0 ? (
          <View className="bg-surface dark:bg-surface-dark rounded-2xl p-5 items-center justify-center border border-stone-200/40 dark:border-stone-800/40">
            <Text
              className="text-muted dark:text-muted-dark text-sm"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              No holidays listed for this month
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
            {holidays.map((item, i) => (
              <View
                key={i}
                className="bg-surface dark:bg-surface-dark flex-row items-center justify-between rounded-2xl p-4 border border-stone-200/50 dark:border-stone-800/50 my-1 shadow-sm"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View className="rounded-xl bg-primary/10 px-3 py-2 items-center justify-center min-w-[56px]">
                    <Text
                      className="text-xs text-primary font-semibold uppercase text-center"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {formatShortDate(item.date)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.name}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            HOLIDAY_COLORS[item.type] ?? "#3b82f6",
                        }}
                      />
                      <Text
                        className="text-muted dark:text-muted-dark text-xs capitalize font-medium"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {item.type}
                      </Text>
                    </View>
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
