import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
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
    order?: string;
  }>();

  /**
   * One-time target scroll order (e.g. order=3 when navigating from Favourites to a specific reading).
   *
   * WHY THIS EFFECT IS NEEDED:
   * ReadingSwiper uses a 5-day sliding window array (`pages`) that re-computes whenever the user
   * swipes left or right between dates. When swiping away and returning to the original date,
   * React unmounts and remounts the target `DayPage` / `ExpandedView` component.
   *
   * If `params.order` remained in route memory or state, the newly mounted component would read
   * `order=3` and re-trigger the auto-scroll animation every time the user swiped back to this day.
   *
   * By immediately consuming `targetOrder` (clearing state to `undefined` and clearing URL params via
   * `router.setParams({ order: undefined })`), we ensure auto-scrolling executes ONLY ONCE during initial
   * navigation, allowing subsequent page swipes to retain natural top positioning.
   */
  const [targetOrder, setTargetOrder] = useState<number | undefined>(() => {
    return params.order != null ? parseInt(params.order, 10) : undefined;
  });

  useEffect(() => {
    if (targetOrder != null) {
      const timer = setTimeout(() => {
        setTargetOrder(undefined);
        if (params.order != null) {
          router.setParams({ order: undefined });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetOrder, params.order]);

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
      isLoading: results.some((r) => r.isLoading && !r.data),
      isInitialLoading: results.some((r) => r.isLoading) && !results.some((r) => r.data != null),
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
    },
    [],
  );

  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  const currentDayData = readingQueries.data[CENTER_INDEX];
  const viewType = (currentDayData?.readings.length ?? 0) === 1 ? "simple" : "expanded";

  const { weekday, formattedDate } = useMemo(() => {
    const displayDate = formatDisplayDate(
      centerDate,
      settings.calendarStyle,
      settings.appLanguage || settings.language,
    );
    return {
      weekday: displayDate.weekday,
      formattedDate: displayDate.dateString,
    };
  }, [centerDate, settings.calendarStyle, settings.appLanguage, settings.language]);

  const navigation = useNavigation();

  useEffect(() => {
    const today = new Date();
    const currentDayData = readingQueries.data[CENTER_INDEX];
    const isToday =
      centerDate.getFullYear() === today.getFullYear() &&
      centerDate.getMonth() === today.getMonth() &&
      centerDate.getDate() === today.getDate();

    if (isToday && currentDayData) {
      markDayCompleted(centerDate).catch(() => {});
    }
  }, [centerDate, readingQueries.data]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (sheetIndex >= 0) {
        e.preventDefault();
        sheetRef.current?.dismiss();
      }
    });
    return unsubscribe;
  }, [navigation, sheetIndex]);

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
      />
      <ReadingSwiper
        data={swiperData}
        isLoading={readingQueries.isLoading}
        onPageChange={handlePageChange}
        rebuildKey={rebuildKey}
        targetOrder={targetOrder}
      />
      <LanguageSwitcherSheet
        ref={sheetRef}
        onChange={handleSheetChange}
        viewType={viewType}
        activeDate={centerDate}
      />
    </View>
  );
}
