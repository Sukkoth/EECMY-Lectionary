import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { ReadingsDB, toDateString } from "@/lib/database";
import { useSettings } from "@/lib/SettingsContext";
import MonthGrid from "@/components/calendar/MonthGrid";
import type { HolidayRow } from "@/lib/types";

const MONTHS_RANGE = 24;

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

export default function CalendarScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const db = useSQLiteContext();
  const { settings } = useSettings();

  const listRef = useRef<FlatList>(null);
  const [holidays, setHolidays] = useState<Map<string, HolidayRow[]>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(MONTHS_RANGE);

  // Build months array centered around today
  const today = useMemo(() => new Date(), []);
  const months = useMemo(() => {
    const items: { year: number; month: number }[] = [];
    for (let i = -MONTHS_RANGE; i <= MONTHS_RANGE; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      items.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return items;
  }, [today]);

  const currentMonth = months[currentIndex];

  // Fetch holidays for the full range on mount / language change
  useEffect(() => {
    const startDate = new Date(months[0].year, months[0].month, 1);
    const endDate = new Date(
      months[months.length - 1].year,
      months[months.length - 1].month + 1,
      0,
    );

    const readingsDB = new ReadingsDB(db);
    readingsDB
      .getHolidaysForDateRange(startDate, endDate, settings.language)
      .then((rows) => {
        const grouped = new Map<string, HolidayRow[]>();
        for (const row of rows) {
          const existing = grouped.get(row.date) ?? [];
          existing.push(row);
          grouped.set(row.date, existing);
        }
        setHolidays(grouped);
      })
      .catch(() => {
        // Silently ignore — calendar data is non-critical
      });
  }, [settings.language, db, months]);

  // Scroll handlers
  const goToMonth = useCallback(
    (index: number) => {
      if (index >= 0 && index < months.length) {
        listRef.current?.scrollToIndex({ index, animated: true });
        setCurrentIndex(index);
      }
    },
    [months.length],
  );

  const goToPrevious = useCallback(
    () => goToMonth(currentIndex - 1),
    [goToMonth, currentIndex],
  );
  const goToNext = useCallback(
    () => goToMonth(currentIndex + 1),
    [goToMonth, currentIndex],
  );

  // Filter holidays for current month
  const currentMonthHolidays = useMemo(() => {
    if (!currentMonth) return [];
    const result: HolidayRow[] = [];
    for (const [, rows] of holidays) {
      for (const h of rows) {
        const [y, m] = h.date.split("-").map(Number);
        if (y === currentMonth.year && m === currentMonth.month + 1) {
          result.push(h);
        }
      }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, currentMonth]);

  const onScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      setCurrentIndex(index);
    },
    [screenWidth],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  );

  const renderMonth = useCallback(
    ({ item }: { item: { year: number; month: number } }) => (
      <View style={{ width: screenWidth }}>
        <MonthGrid
          year={item.year}
          month={item.month}
          holidays={holidays}
          width={screenWidth}
        />
      </View>
    ),
    [holidays, screenWidth],
  );

  if (!currentMonth) return null;

  return (
    <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      {/* Header with navigation arrows */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={goToPrevious}
          activeOpacity={0.7}
          className="rounded-full p-2"
        >
          <Ionicons name="chevron-back" size={22} color="#6B6560" />
        </TouchableOpacity>
        <Text
          className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {formatMonthYear(currentMonth.year, currentMonth.month)}
        </Text>
        <TouchableOpacity
          onPress={goToNext}
          activeOpacity={0.7}
          className="rounded-full p-2"
        >
          <Ionicons name="chevron-forward" size={22} color="#6B6560" />
        </TouchableOpacity>
      </View>

      {/* Month grid (horizontal swipe) */}
      <FlatList
        ref={listRef}
        data={months}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        initialScrollIndex={MONTHS_RANGE}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={renderMonth}
        keyExtractor={(item) => `${item.year}-${item.month}`}
        removeClippedSubviews
      />

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
        {currentMonthHolidays.length === 0 ? (
          <Text
            className="text-muted dark:text-muted-dark text-base"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            No holidays this month
          </Text>
        ) : (
          <FlatList
            data={currentMonthHolidays}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-start py-2">
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
            )}
          />
        )}
      </View>
    </View>
  );
}
