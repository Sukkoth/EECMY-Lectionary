import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  ReadingRepository,
  generateWindow,
  HALF_WINDOW,
  WINDOW_SIZE,
  REBUILD_THRESHOLD,
} from "@/lib/ReadingRepository";
import ReadingHeader from "@/components/reading/ReadingHeader";
import LanguageSwitcherSheet from "@/components/reading/LanguageSwitcherSheet";
import { ReadingSwiper } from "@/components/reading/ReadingSwiper";
import { useSettings } from "@/lib/SettingsContext";

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    year?: string;
    month?: string;
    day?: string;
  }>();

  // ── Single source of truth: the currently viewed date ──
  const initialDate = useMemo(() => {
    return params.year && params.month && params.day
      ? new Date(
          parseInt(params.year, 10),
          parseInt(params.month, 10) - 1,
          parseInt(params.day, 10),
        )
      : new Date();
  }, [params.year, params.month, params.day]);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [windowCenter, setWindowCenter] = useState(initialDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cacheVersion, setCacheVersion] = useState(0);

  const db = useSQLiteContext();
  const { settings } = useSettings();
  const repoRef = useRef<ReadingRepository | null>(null);
  const settingsRef = useRef(settings);
  const [rebuildKey, setRebuildKey] = useState(0);
  const sheetRef = useRef<BottomSheetModal>(null);

  // Re-create repo when language/version changes
  if (settingsRef.current.language !== settings.language || settingsRef.current.version !== settings.version) {
    settingsRef.current = settings;
    repoRef.current = new ReadingRepository(db, settings.language, settings.version);
  }

  // Initialise repo with current language/version
  if (!repoRef.current) {
    repoRef.current = new ReadingRepository(db, settings.language, settings.version);
  }

  // ── Derive the 21-page window from windowCenter ──
  const windowDates = useMemo(() => generateWindow(windowCenter), [windowCenter]);

  // ── Initial / retry fetch (shows loading spinner) ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    repoRef
      .current!.prefetch(windowDates)
      .then(() => {
        setCacheVersion((v) => v + 1);
      })
      .catch((err: Error) => {
        setError(err?.message ?? "Failed to load readings.");
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // ── Silent background prefetch on window rebuild (no spinner) ──
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    repoRef
      .current!.prefetch(windowDates)
      .then(() => {
        setCacheVersion((v) => v + 1);
      })
      .catch(() => {
        // Silently ignore background errors — user already sees content
      });
  }, [windowDates]);

  // ── Prune distant cache entries when window moves ──
  useEffect(() => {
    repoRef.current?.prune(windowCenter);
  }, [windowCenter]);

  // ── Swipe handler: update current date, rebuild window at edges ──
  const handlePageChange = useCallback((date: Date, position: number) => {
    setCurrentDate(date);

    if (position <= REBUILD_THRESHOLD || position >= WINDOW_SIZE - 1 - REBUILD_THRESHOLD) {
      setWindowCenter(date);
      setRebuildKey((k) => k + 1);
    }
  }, []);

  // ── Build swiper data from cache ──
  const swiperData = useMemo(() => {
    return windowDates.map((date) => ({
      date,
      dayData: repoRef.current?.getCached(date) ?? null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDates, cacheVersion]);

  // ── Header info from current date ──
  const currentDayData = repoRef.current?.getCached(currentDate) ?? null;
  const weekday = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const liturgicalDay = currentDayData?.dayInfo?.title ?? null;

  // ── Loading state (only on initial load) ──
  if (loading) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ── Error state ──
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

  // ── Content ──
  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        ref={sheetRef}
        weekday={weekday}
        formattedDate={formattedDate}
        title={liturgicalDay}
        onClose={() => router.back()}
      />
      <ReadingSwiper
        data={swiperData}
        initialIndex={HALF_WINDOW}
        onPageChange={handlePageChange}
        rebuildKey={rebuildKey}
      />
      <LanguageSwitcherSheet ref={sheetRef} />
    </View>
  );
}
