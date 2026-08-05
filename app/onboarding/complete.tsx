import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, useColorScheme, Animated, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";
import { useOnboarding } from "@/lib/OnboardingContext";

export default function CompletionScreen() {
  const isDark = useColorScheme() === "dark";
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

  const languageName = (() => {
    const lang = availableLanguages.find((l) => l.code === settings.language);
    return lang?.language ?? settings.language;
  })();

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
    <SafeAreaView className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      <View className="flex-1 items-center justify-center px-8">
        {/* Animated Checkmark */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="mb-8 items-center"
        >
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? "#16a34a30" : "#DCFCE7" }}
          >
            <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
          </View>
        </Animated.View>

        {/* Title */}
        <Text
          className="mb-4 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          You{"'"}re All Set!
        </Text>

        {/* Recap */}
        <View className="mb-8 items-center rounded-2xl bg-surface dark:bg-surface-dark px-6 py-4">
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Language
          </Text>
          <Text
            className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {languageName}
          </Text>
          <View className="my-2 h-px w-16 bg-stone-200 dark:bg-stone-700" />
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Version
          </Text>
          <Text
            className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {versionName}
          </Text>
          <View className="my-2 h-px w-16 bg-stone-200 dark:bg-stone-700" />
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Calendar System
          </Text>
          <Text
            className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {settings.calendarStyle === "ethiopian"
              ? "Ethiopian (EC)"
              : "Gregorian (GC)"}
          </Text>
        </View>

        {/* Start Reading Button */}
        <TouchableOpacity
          onPress={handleStartReading}
          className="w-full items-center rounded-2xl bg-primary py-4"
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
