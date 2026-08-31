import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import {
  scheduleDailyReminder,
  ensurePermissions,
} from "@/lib/NotificationService";

export default function OnboardingNotificationScreen() {
  const { settings, updateMultipleSettings, updateSetting } = useSettings();
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(false);

  const handleEnableReminder = async () => {
    try {
      setLoading(true);
      const { granted } = await ensurePermissions();
      if (granted) {
        await updateMultipleSettings({
          reminderEnabled: true,
          reminderTime: "08:30",
        });
        void scheduleDailyReminder(
          8,
          30,
          db,
          settings.language,
          settings.version,
          t("appTitle"),
        );
      } else {
        await updateSetting("reminderEnabled", false);
      }
    } catch (err) {
      console.warn("Failed to enable notification during onboarding:", err);
      await updateSetting("reminderEnabled", false);
    } finally {
      setLoading(false);
      router.push("/onboarding/complete");
    }
  };

  const handleSkip = async () => {
    await updateSetting("reminderEnabled", false);
    router.push("/onboarding/complete");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      <View className="flex-1 justify-between px-6 pt-6 pb-8">
        <View className="items-center">
          {/* Visual Bell Icon */}
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="notifications-outline" size={42} color="#3b82f6" />
          </View>

          {/* Title */}
          <Text
            className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Daily Reading Reminder
          </Text>

          {/* Subtitle */}
          <Text
            className="mt-2.5 text-center text-sm text-muted dark:text-muted-dark px-4 leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Stay grounded in the Word. Receive a gentle reminder with today{"'"}s Scripture readings every morning.
          </Text>

          {/* Default Time Card */}
          <View className="mt-8 w-full max-w-sm rounded-2xl bg-surface dark:bg-surface-dark p-4.5 border border-stone-200/60 dark:border-stone-800/60 flex-row items-center gap-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Ionicons name="time-outline" size={22} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                Default Time: 08:30
              </Text>
              <Text
                className="text-xs text-muted dark:text-muted-dark mt-0.5"
                style={{ fontFamily: "ReadingFont" }}
              >
                You can customize this anytime in Settings
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full max-w-sm self-center gap-3">
          <TouchableOpacity
            onPress={handleEnableReminder}
            disabled={loading}
            activeOpacity={0.8}
            className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-sm"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                className="text-center text-base text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Enable Daily Reminder
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.6}
            className="w-full py-3 items-center justify-center"
          >
            <Text
              className="text-center text-sm text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              Not Now — Skip
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
