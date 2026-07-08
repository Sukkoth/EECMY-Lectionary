import { useState, useMemo, useEffect, useCallback } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ReadingsDB, type DayData, toDateString } from "@/lib/database";
import ReadingHeader from "@/components/reading/ReadingHeader";
import { ReadingSwiper } from "@/components/reading/ReadingSwiper";

const RANGE_HALF = 200;

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    year?: string;
    month?: string;
    day?: string;
  }>();

  // Build a date range centered on the navigation target
  const dateRange = useMemo(() => {
    const centerDate =
      params.year && params.month && params.day
        ? new Date(
            parseInt(params.year, 10),
            parseInt(params.month, 10) - 1,
            parseInt(params.day, 10),
          )
        : new Date(); // fallback to today

    const dates: Date[] = [];
    for (let i = -RANGE_HALF; i <= RANGE_HALF; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [params.year, params.month, params.day]);

  const initialIndex = RANGE_HALF;
  const [currentDate, setCurrentDate] = useState(dateRange[initialIndex]);
  const [dataMap, setDataMap] = useState<Map<string, DayData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const db = useSQLiteContext();

  // Fetch readings for the entire date range
  useEffect(() => {
    const startDate = dateRange[0];
    const endDate = dateRange[dateRange.length - 1];

    const readingsDB = new ReadingsDB(db);
    setError(null);

    readingsDB
      .getReadingsForDateRange(startDate, endDate)
      .then((days) => {
        const map = new Map<string, DayData>();
        for (const day of days) {
          const key = toDateString(day.date);
          map.set(key, day);
        }
        setDataMap(map);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load readings.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, dateRange, retryCount]);

  const handlePageChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Build the swiper data: combine dates with their DayData
  const swiperData = useMemo(() => {
    return dateRange.map((date) => ({
      date,
      dayData: dataMap.get(toDateString(date)) ?? null,
    }));
  }, [dateRange, dataMap]);

  // Derive header info from current date
  const currentDayData = dataMap.get(toDateString(currentDate)) ?? null;
  const weekday = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const liturgicalDay = currentDayData?.dayInfo?.title ?? null;

  // Loading state
  if (loading) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center px-6">
        <Text
          className="text-muted dark:text-muted-dark mb-4 text-center"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => setRetryCount((prev) => prev + 1)}
          activeOpacity={0.7}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text
            className="text-center text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        weekday={weekday}
        formattedDate={formattedDate}
        title={liturgicalDay}
        onClose={() => router.back()}
      />
      <ReadingSwiper
        data={swiperData}
        initialIndex={initialIndex}
        onPageChange={handlePageChange}
      />
    </View>
  );
}
