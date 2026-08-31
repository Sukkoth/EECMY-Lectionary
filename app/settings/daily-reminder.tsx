import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Platform,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { formatTimeString } from "@/lib/settings";
import { isDevice24Hour } from "@/lib/timeFormat";
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  ensurePermissions,
  openNotificationSettings,
  openBatteryOptimizationSettings,
} from "@/lib/NotificationService";
import { ReadingsDB, type DayData } from "@/lib/database";

export default function DailyReminderScreen() {
  const isDark = useIsDark();
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const is24H = useMemo(() => isDevice24Hour(), []);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [previewBody, setPreviewBody] = useState<string>("");

  // Load preview body for today's reading
  useEffect(() => {
    async function loadPreview() {
      const verUpper = (settings.version || "am54").toUpperCase();
      try {
        const readingsDB = new ReadingsDB(db);
        const dayData: DayData | null = await readingsDB.getReadingsForDate(
          new Date(),
          settings.language,
          settings.version,
        );
        if (dayData && dayData.readings.length > 0) {
          if (dayData.readings.length === 1) {
            const reading = dayData.readings[0];
            const text = reading.text?.trim() ?? "";
            const ref = reading.reference?.trim() ?? "";
            if (text.length > 0 && text.length <= 240) {
              setPreviewBody(`"${text}"\n\n— ${ref} [${verUpper}]`);
            } else if (ref.length > 0) {
              setPreviewBody(`— ${ref} [${verUpper}]`);
            }
          } else {
            const references = dayData.readings
              .map((r) => r.reference?.trim())
              .filter(Boolean)
              .join(" • ");
            setPreviewBody(`${references} [${verUpper}]`);
          }
        } else {
          setPreviewBody("Open the app to read today's lectionary passage.");
        }
      } catch {
        setPreviewBody("Open the app to read today's lectionary passage.");
      }
    }
    loadPreview();
  }, [db, settings.language, settings.version]);

  const getReminderDate = (): Date => {
    const [hStr, mStr] = (settings.reminderTime || "08:30").split(":");
    const d = new Date();
    d.setHours(parseInt(hStr, 10) || 8, parseInt(mStr, 10) || 30, 0, 0);
    return d;
  };

  const handleTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event.type === "dismissed") return;

    if (selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      const hStr = String(hour).padStart(2, "0");
      const mStr = String(minute).padStart(2, "0");
      const newTime = `${hStr}:${mStr}`;

      await updateSetting("reminderTime", newTime);

      if (settings.reminderEnabled) {
        void scheduleDailyReminder(
          hour,
          minute,
          db,
          settings.language,
          settings.version,
          t("appTitle"),
        );
      }
    }
  };

  const handleSaveModalTime = async (selectedDate: Date) => {
    setShowTimePicker(false);
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    const hStr = String(hour).padStart(2, "0");
    const mStr = String(minute).padStart(2, "0");
    const newTime = `${hStr}:${mStr}`;

    await updateSetting("reminderTime", newTime);

    if (settings.reminderEnabled) {
      void scheduleDailyReminder(
        hour,
        minute,
        db,
        settings.language,
        settings.version,
        t("appTitle"),
      );
    }
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ScrollView
        className="flex-1 px-6 pt-12"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View className="mb-6 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5 shadow-sm border border-stone-200/50 dark:border-stone-800/50"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("dailyReminder")}
          </Text>
        </View>

        {/* Main Settings Card */}
        <View className="bg-surface dark:bg-surface-dark mb-6 rounded-2xl px-5 py-4">
          {/* Row 1: Enable Switch */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1 pr-2">
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("dailyReminder")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-xs leading-snug"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("dailyReminderDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const { granted, canAskAgain } = await ensurePermissions();
                  if (!granted) {
                    if (!canAskAgain) {
                      Alert.alert(
                        "Notifications Disabled",
                        "Please enable notifications in system settings to receive daily reminders.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Open Settings", onPress: () => void openNotificationSettings() },
                        ]
                      );
                    }
                    return;
                  }

                  await updateSetting("reminderEnabled", true);
                  const [hStr, mStr] = (settings.reminderTime || "08:30").split(":");
                  const hour = parseInt(hStr, 10) || 8;
                  const minute = parseInt(mStr, 10) || 30;
                  void scheduleDailyReminder(
                    hour,
                    minute,
                    db,
                    settings.language,
                    settings.version,
                    t("appTitle"),
                  );
                } else {
                  await updateSetting("reminderEnabled", false);
                  void cancelDailyReminder();
                }
              }}
              trackColor={{ false: isDark ? "#3f3f46" : "#e4e4e7", true: "#3b82f6" }}
              thumbColor="white"
            />
          </View>

          {/* Row 2: Reminder Time Selector (when enabled) */}
          {settings.reminderEnabled && (
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
              className="border-t border-stone-200/60 dark:border-stone-800/60 mt-4 flex-row items-center justify-between pt-3.5"
            >
              <Text
                className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {t("reminderTime")}
              </Text>

              <View className="bg-primary/10 rounded-full px-3.5 py-1.5 flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={15} color="#3b82f6" />
                <Text
                  className="text-primary text-sm font-semibold"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {formatTimeString(settings.reminderTime || "07:00")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Lockscreen Notification Preview */}
        {settings.reminderEnabled && (
          <View className="bg-surface dark:bg-surface-dark mb-6 rounded-2xl px-5 py-4">
            <Text
              className="text-xs text-muted dark:text-muted-dark font-medium uppercase tracking-wider mb-3"
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("notificationPreview")}
            </Text>

            <View className="bg-bg-warm dark:bg-bg-warm-dark rounded-xl p-4 border border-stone-200/60 dark:border-stone-800/60">
              <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-stone-200/40 dark:border-stone-800/40">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary rounded-md p-1">
                    <Ionicons name="book" size={12} color="#FFFFFF" />
                  </View>
                  <Text
                    className="text-xs font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("appTitle")}
                  </Text>
                </View>
                <Text
                  className="text-[10px] text-muted dark:text-muted-dark"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {formatTimeString(settings.reminderTime || "07:00")}
                </Text>
              </View>

              <Text
                className="text-xs text-[#2D2A24] dark:text-[#E8E4DC] leading-relaxed"
                style={{ fontFamily: "ReadingFont" }}
                numberOfLines={4}
              >
                {previewBody}
              </Text>
            </View>
          </View>
        )}

        {/* Android Battery Optimization / Reliability Tip */}
        {Platform.OS === "android" &&
          settings.reminderEnabled &&
          !settings.batteryOptimizationDismissed && (
            <View className="mt-4 rounded-2xl border border-stone-200/70 bg-[#F5F2EB] p-4 dark:border-stone-800 dark:bg-[#25221E]">
              <View className="flex-row items-start gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
                  <Ionicons name="battery-charging-outline" size={18} color="#D97706" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-xs font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      Reliable Notification Delivery
                    </Text>
                    <TouchableOpacity
                      onPress={() => void updateSetting("batteryOptimizationDismissed", true)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="close" size={16} color={isDark ? "#8A8480" : "#A8A29E"} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    className="mt-1 text-[11px] leading-relaxed text-muted dark:text-muted-dark"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    To ensure reminders arrive on time when the device is idle, set App Battery Usage to "Unrestricted" in system settings.
                  </Text>

                  <View className="mt-2.5 flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={async () => {
                        await openBatteryOptimizationSettings();
                        await updateSetting("batteryOptimizationDismissed", true);
                      }}
                      activeOpacity={0.7}
                      className="rounded-xl border border-stone-300/80 bg-white px-3 py-1.5 dark:border-stone-700/80 dark:bg-[#1A1815]"
                    >
                      <Text
                        className="text-xs font-medium text-primary"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        Adjust Battery Optimization →
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => void updateSetting("batteryOptimizationDismissed", true)}
                      activeOpacity={0.6}
                    >
                      <Text
                        className="text-xs text-muted dark:text-muted-dark"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        Already Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
      </ScrollView>

      {/* Time Picker Component */}
      {showTimePicker &&
        (Platform.OS === "ios" ? (
          <Modal
            visible={showTimePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <Pressable
              className="flex-1 bg-black/60 items-center justify-end"
              onPress={() => setShowTimePicker(false)}
            >
              <Pressable
                className="bg-surface dark:bg-surface-dark w-full rounded-t-3xl p-6 shadow-2xl border-t border-stone-200/50 dark:border-stone-800/50"
                onPress={(e) => e.stopPropagation()}
              >
                <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
                  <Text
                    className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {t("reminderTime")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(false)}
                    className="bg-primary/10 rounded-full px-4 py-1.5"
                  >
                    <Text
                      className="text-primary text-sm font-semibold"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {t("done")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={getReminderDate()}
                  mode="time"
                  is24Hour={is24H}
                  display="spinner"
                  textColor={isDark ? "#E8E4DC" : "#2D2A24"}
                  themeVariant={isDark ? "dark" : "light"}
                  onChange={handleTimeChange}
                />
              </Pressable>
            </Pressable>
          </Modal>
        ) : (
          <DateTimePicker
            value={getReminderDate()}
            mode="time"
            is24Hour={is24H}
            display="clock"
            onChange={handleTimeChange}
          />
        ))}
    </SafeAreaView>
  );
}
