import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Appearance,
  ActivityIndicator,
  type DimensionValue,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_STREAK } from "@/lib/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { ReadingsDB, type DayData } from "@/lib/database";
import { useSettings } from "@/lib/SettingsContext";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const SECTION_LABELS: Record<string, string> = {
  OLD_TESTAMENT: "Old Testament",
  EPISTLE: "Epistle",
  GOSPEL: "Gospel",
};

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const streak = MOCK_STREAK;
  const db = useSQLiteContext();
  const readingDate = useMemo(() => new Date(), []);
  const { settings } = useSettings();

  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = useCallback(() => {
    const readingsDB = new ReadingsDB(db);
    readingsDB
      .getReadingsForDate(readingDate, settings.language, settings.version)
      .then((result) => {
        setDayData(result);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load readings. Please try again.");
        setDayData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [db, readingDate, settings.language, settings.version]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReadings();
    }, [fetchReadings]),
  );

  const isMulti = dayData && dayData.readings.length > 1;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const progress = Math.min(Math.max(streak.current / streak.best, 0), 1);
  const progressPercent = `${Math.round(progress * 100)}%`;

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="mt-8 flex-1 px-6">
        {/* HEADER */}
        <View className="mb-7 mt-4 flex-row items-center justify-between">
          <Text
            className="text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Daily Readings
          </Text>
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2"
          >
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
          </TouchableOpacity>
        </View>

        {/* DATE CARD */}
        <View className="bg-surface dark:bg-surface-dark mb-7 flex-row items-center rounded-2xl px-4 py-3.5">
          <View className="bg-primary-dimmed rounded-lg p-2">
            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
          </View>
          <Text
            className="ml-3 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {formatDate(readingDate)}
          </Text>
        </View>

        {/* READING CARD AREA (loading / error / no-data / loaded) */}
        {loading ? (
          /* LOADING STATE */
          <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 items-center justify-center rounded-2xl px-6 py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : error ? (
          /* ERROR STATE */
          <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 items-center justify-center rounded-2xl px-6 py-8">
            <Ionicons name="alert-circle-outline" size={44} color="#ef4444" />
            <Text
              className="mt-4 text-center text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
              className="bg-primary mt-6 rounded-xl px-6 py-3"
            >
              <Text
                className="text-center text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Check for Updates
              </Text>
            </TouchableOpacity>
          </View>
        ) : !dayData ? (
          /* NO DATA STATE */
          <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 items-center justify-center rounded-2xl px-6 py-8">
            <Ionicons name="book-outline" size={44} color="#6B6560" />
            <Text
              className="mt-4 text-center text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              No readings available for this period
            </Text>
            <Text
              className="text-muted dark:text-muted-dark mt-1 text-center text-sm"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Readings may not have been downloaded yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
              className="bg-primary mt-6 rounded-xl px-6 py-3"
            >
              <Text
                className="text-center text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Check for Content Updates
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* DATA — DAILY READING CARD */
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/reading",
                params: {
                  year: readingDate.getFullYear(),
                  month: readingDate.getMonth() + 1,
                  day: readingDate.getDate(),
                },
              })
            }
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark mb-7 flex-1 justify-center rounded-2xl px-6 py-8"
          >
            {isMulti ? (
              /* MULTI-READING VIEW (references + dayInfo only) */
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* DayInfo title + description */}
                {dayData.dayInfo?.title ? (
                  <Text
                    className="mb-1 text-center text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {dayData.dayInfo.title}
                  </Text>
                ) : (
                  <Text
                    className="mb-5 text-center text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    Readings For {formatDate(readingDate)}
                  </Text>
                )}
                {dayData.dayInfo?.description && (
                  <Text
                    className="text-muted dark:text-muted-dark mb-5 text-center text-sm leading-[20px]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {dayData.dayInfo.description}
                  </Text>
                )}

                {/* Reading references */}
                {dayData.readings.map((reading, index) => (
                  <View key={index} className="mb-8 items-center">
                    <Text
                      className="text-primary text-center text-xs uppercase tracking-widest"
                      style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                    >
                      {SECTION_LABELS[reading.section] ?? reading.section}
                    </Text>
                    <Text
                      className="text-center text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                    >
                      {reading.reference}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              /* SINGLE-READING VIEW (full text + reference) */
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                >
                  <Text
                    className="text-center text-2xl leading-[28px] text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {dayData.readings[0]?.text}
                  </Text>
                  <Text
                    className="text-muted dark:text-muted-dark mt-6 text-center text-xl leading-tight"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {dayData.readings[0]?.reference} ({dayData.readings[0]?.version.toUpperCase()})
                  </Text>
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* READING STREAK CARD */}
        <View className="bg-surface dark:bg-surface-dark mb-8 rounded-2xl px-5 py-5">
          {/* Streak header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Reading Streak
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Best record: {streak.best} days
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-primary text-3xl font-bold leading-tight"
                style={{ fontFamily: "ReadingFont", fontWeight: "700" }}
              >
                {streak.current}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                days
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: progressPercent as DimensionValue }}
            />
          </View>

          {/* Weekly indicators */}
          <View className="mt-4 flex-row justify-between">
            {streak.completedDays.map((completed, index) => (
              <View key={index} className="items-center">
                <View
                  className={`h-7 w-7 items-center justify-center rounded-lg ${
                    completed ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text
                  className="text-muted dark:text-muted-dark mt-1.5 text-xs"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {DAY_LABELS[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
