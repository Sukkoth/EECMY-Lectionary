import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/SettingsContext";
import { useOnboarding } from "@/lib/OnboardingContext";

export default function CompletionScreen() {
  const { settings, availableLanguages } = useSettings();
  const { completeOnboarding } = useOnboarding();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const versionName = (() => {
    const lang = availableLanguages.find((l) => l.code === settings.language);
    const version = lang?.versions.find((v) => v.code === settings.version);
    return version?.label ?? settings.version.toUpperCase();
  })();

  const handleStartReading = async () => {
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      <View className="flex-1 items-center justify-center px-6">
        {/* Clean Animated Checkmark */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="mb-6 items-center"
        >
          <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <Ionicons name="checkmark-circle" size={52} color="#10b981" />
          </View>
        </Animated.View>

        {/* Title */}
        <Text
          className="mb-2 text-3xl text-[#2D2A24] dark:text-[#E8E4DC] text-center"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          You{"'"}re All Set!
        </Text>

        <Text
          className="mb-8 text-sm text-muted dark:text-muted-dark text-center"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Here is a summary of your setup
        </Text>

        {/* Clean Minimal Summary Card */}
        <View className="mb-8 w-full max-w-sm rounded-2xl bg-surface dark:bg-surface-dark p-5 border border-stone-200/60 dark:border-stone-800/60">
          {/* 1. Version */}
          <View className="flex-row items-center justify-between py-2">
            <Text
              className="text-sm text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Version
            </Text>
            <Text
              className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {versionName}
            </Text>
          </View>

          <View className="my-1.5 h-px w-full bg-stone-200/50 dark:bg-stone-800/50" />

          {/* 2. App Language */}
          <View className="flex-row items-center justify-between py-2">
            <Text
              className="text-sm text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              App Language
            </Text>
            <Text
              className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              English
            </Text>
          </View>

          <View className="my-1.5 h-px w-full bg-stone-200/50 dark:bg-stone-800/50" />

          {/* 3. Calendar System */}
          <View className="flex-row items-center justify-between py-2">
            <Text
              className="text-sm text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Calendar System
            </Text>
            <Text
              className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {settings.calendarStyle === "ethiopian"
                ? "Ethiopian (EC)"
                : "Gregorian (GC)"}
            </Text>
          </View>

          <View className="my-1.5 h-px w-full bg-stone-200/50 dark:bg-stone-800/50" />

          {/* 4. Daily Reminder */}
          <View className="flex-row items-center justify-between py-2">
            <Text
              className="text-sm text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Daily Reminder
            </Text>
            <Text
              className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {settings.reminderEnabled
                ? (settings.reminderTime || "08:30")
                : "Off"}
            </Text>
          </View>
        </View>

        {/* Start Reading Button */}
        <TouchableOpacity
          onPress={handleStartReading}
          className="w-full max-w-sm items-center justify-center rounded-2xl bg-primary py-4"
          activeOpacity={0.8}
        >
          <Text
            className="text-base font-semibold text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Start Reading
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
