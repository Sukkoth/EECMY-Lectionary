import { useState, useMemo, useCallback } from "react";
import { View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getReadingForDate, getMultiReadingForDate } from "../../data/mock_reading";
import ReadingHeader from "../../components/reading/ReadingHeader";
import { ReadingSwiper } from "../../components/reading/ReadingSwiper";

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
        : new Date(2026, 6, 5); // fallback to Jul 5

    const dates: Date[] = [];
    for (let i = -5; i <= 5; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [params.year, params.month, params.day]);

  // The initially requested date is always the middle (index 5)
  const initialIndex = 5;

  const [currentDate, setCurrentDate] = useState(dateRange[initialIndex]);

  const handlePageChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Derive header info from current date
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth() + 1;
  const d = currentDate.getDate();
  const single = getReadingForDate(y, m, d);
  const multi = getMultiReadingForDate(y, m, d);

  const weekday = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const season = multi?.season ?? single?.season ?? "";

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        weekday={weekday}
        formattedDate={formattedDate}
        season={season}
        onClose={() => router.back()}
      />
      <ReadingSwiper
        dates={dateRange}
        initialIndex={initialIndex}
        onPageChange={handlePageChange}
      />
    </View>
  );
}
