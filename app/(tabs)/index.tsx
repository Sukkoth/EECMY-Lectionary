import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  Appearance,
  Animated,
  type DimensionValue,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useTodayReading } from "@/lib/hooks/useTodayReading";
import { useStreak } from "@/lib/hooks/useStreak";
import { useSQLiteContext } from "expo-sqlite";
import { scheduleDailyReminder } from "@/lib/NotificationService";
import { useCheckContentUpdate } from "@/lib/hooks/useCheckContentUpdate";
import { FormattedText } from "@/lib/formatText";
import {
  formatDisplayDate,
  gregorianToEthiopian,
  formatEvangelistYear,
} from "@/lib/ethiopianCalendar";
import { getWeekStart } from "@/lib/StreakService";
import * as Notifications from "expo-notifications";
import { useTranslation, getDayLabels } from "@/lib/i18n";

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings, updateSetting } = useSettings();
  const { t, lang } = useTranslation();
  const { hasUpdate, checkUpdate, updateInfo } = useCheckContentUpdate();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasUpdate) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [hasUpdate, pulseAnim]);

  const readingDate = new Date();
  const ethDate = gregorianToEthiopian(readingDate);

  const { data: dayData, isLoading, error: queryError } = useTodayReading(
    readingDate,
    settings.language,
    settings.version,
  );
  const { data: streak, refetch: refetchStreak } = useStreak();
  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      refetchStreak();
      checkUpdate();
      if (settings.reminderEnabled) {
        const [hStr, mStr] = (settings.reminderTime || "07:00").split(":");
        const hour = parseInt(hStr, 10) || 7;
        const minute = parseInt(mStr, 10) || 0;
        Notifications.getAllScheduledNotificationsAsync().then(({ length }) => {
          if (length < 5) {
            scheduleDailyReminder(
              hour,
              minute,
              db,
              settings.language,
              settings.version,
              t("appTitle"),
              21,
            );
          }
        });
      }
    }, [
      refetchStreak,
      checkUpdate,
      settings.reminderEnabled,
      settings.reminderTime,
      settings.language,
      settings.version,
      db,
      t,
    ]),
  );

  const isMulti = dayData && dayData.readings.length > 1;

  const formatDate = (date: Date): string => {
    return formatDisplayDate(date, settings.calendarStyle, lang).fullString;
  };

  const currentWeekStart = getWeekStart(new Date());
  const rawStreak = streak ?? { current: 0, best: 0, completedDays: [false, false, false, false, false, false, false], weekStartDate: "" };
  const safeStreak = {
    ...rawStreak,
    completedDays: rawStreak.weekStartDate === currentWeekStart
      ? rawStreak.completedDays
      : [false, false, false, false, false, false, false],
  };
  const progress = safeStreak.best > 0 ? Math.min(Math.max(safeStreak.current / safeStreak.best, 0), 1) : 0;
  const progressPercent = `${Math.round(progress * 100)}%`;

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    updateSetting("theme", newTheme);
    Appearance.setColorScheme(newTheme);
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 pt-12">
        {/* HEADER */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text
            className="flex-1 text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("appTitle")}
          </Text>
          <View className="flex-row items-center gap-2">
            {hasUpdate && (
              <TouchableOpacity
                onPress={() => {
                  if (updateInfo) {
                    router.push({
                      pathname: "/settings/check-updates/content",
                      params: {
                        preselectYear: String(updateInfo.year),
                        ...(updateInfo.lang ? { preselectLang: updateInfo.lang } : {}),
                        ...(updateInfo.version ? { preselectVersion: updateInfo.version } : {}),
                        autoCheck: "true",
                      },
                    });
                  } else {
                    router.push({
                      pathname: "/settings/check-updates/content",
                      params: { autoCheck: "true" },
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Animated.View
                  className="bg-primary/15 rounded-full p-2"
                  style={{ transform: [{ scale: pulseAnim }] }}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={22}
                    color="#3b82f6"
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
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
        </View>

        {/* DATE CARD */}
        <View className="bg-surface dark:bg-surface-dark mb-7 flex-row items-center justify-between rounded-2xl px-4 py-3.5">
          <View className="flex-1 flex-row items-center">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
            </View>
            <Text
              className="ml-3 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              numberOfLines={1}
            >
              {formatDate(readingDate)}
            </Text>
          </View>
          <View className="bg-primary/10 ml-2 rounded-full px-3.5 py-1.5">
            <Text
              className="text-primary text-sm font-semibold"
              style={{ fontFamily: "ReadingFont" }}
            >
              {formatEvangelistYear(ethDate.year, lang)}
            </Text>
          </View>
        </View>

        {/* READING CARD AREA (loading / error / no-data / loaded) */}
        {isLoading ? (
          /* LOADING STATE */
          <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 items-center justify-center rounded-2xl px-6 py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : queryError ? (
          /* ERROR STATE */
          <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 items-center justify-center rounded-2xl px-6 py-8">
            <Ionicons name="alert-circle-outline" size={44} color="#ef4444" />
            <Text
              className="mt-4 text-center text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {queryError?.message ?? "Failed to load readings."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings/check-updates/content")}
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
              onPress={() => router.push("/settings/check-updates/content")}
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
                      {reading.section === "OLD_TESTAMENT" ? t("oldTestament") : reading.section === "EPISTLE" ? t("epistle") : reading.section === "GOSPEL" ? t("gospel") : reading.section}
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
                  <FormattedText
                    text={dayData.readings[0]?.text}
                    className="text-center text-2xl leading-[28px] text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400", textAlign: "center" }}
                  />
                  <Text
                    className="text-muted dark:text-muted-dark mt-6 text-center text-xl leading-tight"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {dayData.readings[0]?.reference} ({dayData.readings[0]?.version.toUpperCase()})
                  </Text>
                </ScrollView>
              </>
            )}
            {/* Tap affordance */}
            <View className="mt-4 flex-row items-center justify-center opacity-70">
              <View className="bg-primary/10 mr-2 rounded-full p-1.5">
                <Ionicons name="book-outline" size={12} color="#3b82f6" />
              </View>
              <Text
                className="text-primary text-xs tracking-wide"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {t("readPassage")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color="#3b82f6"
                style={{ marginLeft: 2, marginTop: 1 }}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* READING STREAK CARD */}
        <View className="bg-surface dark:bg-surface-dark mb-8 rounded-2xl px-5 py-5 border border-stone-200/40 dark:border-stone-800/40">
          {/* Streak header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="rounded-xl bg-amber-500/10 p-2.5">
                <Ionicons name="flame" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("readingStreak")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("bestRecord")}: {safeStreak.best}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Text
                className="text-primary text-3xl font-semibold leading-tight"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {safeStreak.current}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark text-[11px] uppercase tracking-wider"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {t("days")}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: progressPercent as DimensionValue }}
            />
          </View>

          {/* Weekly day bars */}
          <View className="mt-4 flex-row justify-between">
            {safeStreak.completedDays.map((completed, index) => {
              const todayDayOfWeek = readingDate.getDay();
              const isToday = index === todayDayOfWeek;

              return (
                <View key={index} className="items-center" style={{ width: 36 }}>
                  <View
                    className={`h-2.5 w-full overflow-hidden rounded-full ${
                      isToday
                        ? "bg-primary/20"
                        : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  >
                    <View
                      className={`h-full rounded-full ${
                        completed ? "bg-primary" : isToday ? "bg-primary/50" : ""
                      }`}
                      style={{ width: completed ? "100%" : isToday ? "50%" : "0%" }}
                    />
                  </View>
                  <Text
                    className={`mt-1.5 text-xs ${
                      isToday
                        ? "text-primary font-semibold"
                        : "text-muted dark:text-muted-dark font-normal"
                    }`}
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {getDayLabels(lang)[index]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
