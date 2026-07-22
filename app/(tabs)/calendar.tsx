import { useMemo, useRef, useState, useCallback } from "react";
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
import { router } from "expo-router";
import MonthGrid from "@/components/calendar/MonthGrid";
import {
  useHolidays,
  getHolidaysForMonth,
  getHolidaysListForMonth,
} from "@/lib/hooks/useHolidays";
import { useSettings } from "@/lib/SettingsContext";
import { HOLIDAY_COLORS } from "@/constants";

function formatMonth(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
  });
}

function formatYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", {
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): { monthShort: string; dayNum: number } {
  const [, m, d] = dateStr.split("-").map(Number);
  const date = new Date(2000, m - 1, d);
  const monthShort = date.toLocaleDateString("en-US", { month: "short" });
  return { monthShort, dayNum: d };
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

  const handleJumpToToday = useCallback(() => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });
  }, [today]);

  const isCurrentTodayMonth =
    current.year === today.getFullYear() && current.month === today.getMonth();

  return (
    <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
        <View>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC] tracking-tight"
            style={{ fontFamily: "ReadingFont" }}
          >
            {formatMonth(current.year, current.month)}
          </Text>
          <Text
            className="text-xs text-primary font-semibold tracking-wide uppercase mt-0.5"
            style={{ fontFamily: "ReadingFont" }}
          >
            {formatYear(current.year, current.month)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {!isCurrentTodayMonth && (
            <TouchableOpacity
              onPress={handleJumpToToday}
              activeOpacity={0.75}
              className="bg-primary/10 rounded-full px-3 py-1.5 flex-row items-center gap-1"
            >
              <Ionicons name="today-outline" size={14} color="#3b82f6" />
              <Text
                className="text-xs text-primary font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                Today
              </Text>
            </TouchableOpacity>
          )}

          {/* Capsule Chevron Controls */}
          <View className="bg-surface dark:bg-surface-dark flex-row items-center rounded-2xl border border-stone-200/60 dark:border-stone-800/60 p-1">
            <TouchableOpacity
              onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, -1))}
              className="p-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
            <View className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 my-auto mx-0.5" />
            <TouchableOpacity
              onPress={() => setCurrent((prev) => addMonths(prev.year, prev.month, 1))}
              className="p-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Swipeable Month Grid */}
      <View {...panResponder.panHandlers}>
        <MonthGrid
          year={current.year}
          month={current.month}
          holidays={holidayMap}
          width={screenWidth}
        />
      </View>

      {/* Section Divider */}
      <View className="mx-6 my-4 border-b border-stone-200/50 dark:border-stone-800/50" />

      {/* Holidays List */}
      <View className="flex-1 px-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="text-muted dark:text-muted-dark text-xs uppercase tracking-widest font-semibold"
            style={{ fontFamily: "ReadingFont" }}
          >
            Holidays & Events
          </Text>
          <View className="bg-primary/10 rounded-full px-2.5 py-0.5">
            <Text
              className="text-[11px] text-primary font-semibold"
              style={{ fontFamily: "ReadingFont" }}
            >
              {holidays.length} {holidays.length === 1 ? "event" : "events"}
            </Text>
          </View>
        </View>

        {holidays.length === 0 ? (
          <View className="bg-surface dark:bg-surface-dark rounded-2xl p-6 items-center justify-center border border-stone-200/40 dark:border-stone-800/40 my-2">
            <Ionicons name="sparkles-outline" size={22} color="#6b6560" />
            <Text
              className="text-muted dark:text-muted-dark mt-2 text-sm text-center"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              No specific feasts listed for this month
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            {holidays.map((item, i) => {
              const { monthShort, dayNum } = formatShortDate(item.date);
              return (
                <View
                  key={i}
                  className="bg-surface dark:bg-surface-dark flex-row items-center justify-between rounded-2xl p-4 border border-stone-200/50 dark:border-stone-800/50 my-1.5"
                >
                  {/* Left Color Accent Bar */}
                  <View
                    className="w-1.5 h-10 rounded-full mr-3.5"
                    style={{
                      backgroundColor:
                        HOLIDAY_COLORS[item.type] ?? "#3b82f6",
                    }}
                  />

                  {/* Feast Info */}
                  <View className="flex-1">
                    <Text
                      className="text-base text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.name}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <Text
                        className="text-xs text-primary font-semibold uppercase tracking-wider"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {monthShort} {dayNum}
                      </Text>
                      <Text className="text-xs text-muted dark:text-muted-dark">•</Text>
                      <Text
                        className="text-muted dark:text-muted-dark text-xs capitalize font-medium"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {item.type}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
