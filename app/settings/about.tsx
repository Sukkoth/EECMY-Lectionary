import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "@/lib/i18n";

export default function AboutSettingsScreen() {
  const isDark = useColorScheme() === "dark";
  const { t } = useTranslation();

  const featureKeys = [
    "featureDailyReadings",
    "featureDualCalendar",
    "featureEvangelistYears",
    "featureOffline",
    "featureMultiLang",
    "featureStreak",
    "featureSunday",
    "featureCustomization",
  ] as const;

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Header */}
      <View className="border-b border-stone-200 px-6 pb-4 pt-12 dark:border-stone-800">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("aboutApp")}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 56, paddingTop: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Title Section */}
        <View className="mb-9 px-6">
          <Text
            className="mb-1.5 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("appTitle")}
          </Text>
          <Text
            className="text-primary text-base font-semibold uppercase tracking-wider"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("appVersion")} 1.0.0
          </Text>
        </View>

        {/* Church Tradition Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-sm uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("churchTradition")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-xl leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("churchTraditionDesc")}
          </Text>
        </View>

        {/* Purpose & Mission Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-sm uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("missionTitle")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-xl leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("missionDesc")}
          </Text>
        </View>

        {/* Key Features Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-4 ml-0.5 text-sm uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("keyFeaturesTitle")}
          </Text>
          <View className="gap-4">
            {featureKeys.map((key) => (
              <View key={key} className="flex-row items-start gap-3">
                <Text
                  className="text-primary text-xl leading-relaxed"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  •
                </Text>
                <Text
                  className="flex-1 text-xl leading-relaxed text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t(key as any)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Acknowledgements Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-sm uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("acknowledgements")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-xl leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("acknowledgementsDesc")}
          </Text>
        </View>

        {/* Soli Deo Gloria Footer */}
        <View className="mt-4 px-6">
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Soli Deo Gloria • EECMY Lectionary Companion
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
