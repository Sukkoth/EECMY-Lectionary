import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { READING_KEYS, usePrefetchReadings } from "@/lib/hooks/useReading";
import ReadingHeader from "@/components/reading/ReadingHeader";
import LanguageSwitcherSheet from "@/components/reading/LanguageSwitcherSheet";
import { ReadingSwiper } from "@/components/reading/ReadingSwiper";
import { useSettings } from "@/lib/SettingsContext";
import { markDayCompleted } from "@/lib/StreakService";
import { ReadingsDB, toDateString, type DayData } from "@/lib/database";
import { useSQLiteContext } from "expo-sqlite";
import { formatDisplayDate } from "@/lib/ethiopianCalendar";

import { useTranslation } from "@/lib/i18n";

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const CENTER_INDEX = 2;
const PREFETCH_RANGE = 5;

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    year?: string;
    month?: string;
    day?: string;
  }>();

  const initialDate = useMemo(() => {
    return params.year != null && params.month != null && params.day != null
      ? new Date(
          parseInt(params.year, 10),
          parseInt(params.month, 10) - 1,
          parseInt(params.day, 10),
        )
      : new Date();
  }, [params.year, params.month, params.day]);

  const [centerDate, setCenterDate] = useState(initialDate);
  const [rebuildKey, setRebuildKey] = useState(0);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);

  const { settings } = useSettings();
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const prefetchReadings = usePrefetchReadings();

  useEffect(() => {
    setCenterDate(initialDate);
    setRebuildKey((k) => k + 1);
  }, [initialDate]);

  const pages = useMemo(
    () => [
      addDays(centerDate, -2),
      addDays(centerDate, -1),
      centerDate,
      addDays(centerDate, 1),
      addDays(centerDate, 2),
    ],
    [centerDate],
  );

  const readingQueries = useQueries({
    queries: pages.map((date) => ({
      queryKey: READING_KEYS.byDate(toDateString(date), settings.language, settings.version),
      queryFn: async (): Promise<DayData | null> => {
        const readingsDB = new ReadingsDB(db);
        return readingsDB.getReadingsForDate(date, settings.language, settings.version);
      },
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
    })),
    combine: (results) => ({
      data: results.map((r) => r.data ?? null),
      isLoading: results.some((r) => r.isLoading),
      error: results.find((r) => r.error)?.error ?? null,
    }),
  });

  const swiperData = useMemo(
    () =>
      pages.map((date, i) => ({
        date,
        dayData: readingQueries.data[i],
      })),
    [pages, readingQueries.data],
  );

  useEffect(() => {
    const dates: Date[] = [];
    for (let i = -PREFETCH_RANGE; i <= PREFETCH_RANGE; i++) {
      dates.push(addDays(centerDate, i));
    }
    prefetchReadings(dates, settings.language, settings.version);
  }, [centerDate, settings.language, settings.version, prefetchReadings]);

  const handlePageChange = useCallback(
    (date: Date, position: number) => {
      const offset = position - CENTER_INDEX;
      setCenterDate((d) => addDays(d, offset));
      setRebuildKey((k) => k + 1);
    },
    [],
  );

  const currentDayData = readingQueries.data[CENTER_INDEX];
  const viewType = (currentDayData?.readings.length ?? 0) === 1 ? "simple" : "expanded";
  const displayDate = formatDisplayDate(centerDate, settings.calendarStyle);
  const weekday = displayDate.weekday;
  const formattedDate = displayDate.dateString;
  const liturgicalDay = currentDayData?.dayInfo?.title ?? null;

  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  const navigation = useNavigation();

  useEffect(() => {
    const today = new Date();
    const isToday =
      centerDate.getFullYear() === today.getFullYear() &&
      centerDate.getMonth() === today.getMonth() &&
      centerDate.getDate() === today.getDate();

    if (isToday && currentDayData) {
      markDayCompleted(centerDate).catch(() => {});
    }
  }, [centerDate, currentDayData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (sheetIndex >= 0) {
        e.preventDefault();
        sheetRef.current?.dismiss();
      }
    });
    return unsubscribe;
  }, [navigation, sheetIndex]);

  if (readingQueries.isLoading) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (readingQueries.error) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center px-6">
        <Text
          className="text-muted dark:text-muted-dark mb-4 text-center"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {(readingQueries.error as Error).message}
        </Text>
        <TouchableOpacity
          onPress={() => queryClient.invalidateQueries({ queryKey: READING_KEYS.all })}
          activeOpacity={0.7}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text
            className="text-center text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("tryAgain")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        ref={sheetRef}
        weekday={weekday}
        formattedDate={formattedDate}
        title={liturgicalDay}
      />
      <ReadingSwiper
        data={swiperData}
        onPageChange={handlePageChange}
        rebuildKey={rebuildKey}
      />
      <LanguageSwitcherSheet ref={sheetRef} onChange={handleSheetChange} viewType={viewType} />
    </View>
  );
}
