import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
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
        <View className="mb-8 px-6">
          <Text
            className="text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("appTitle")}
          </Text>
        </View>


        {/* Purpose & Mission Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("missionTitle")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-base leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("missionDesc")}
          </Text>
        </View>

        {/* Key Features Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-4 ml-0.5 text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("keyFeaturesTitle")}
          </Text>
          <View className="gap-3">
            {featureKeys.map((key) => (
              <View key={key} className="flex-row items-start gap-2.5">
                <Text
                  className="text-primary text-base leading-relaxed"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  •
                </Text>
                <Text
                  className="flex-1 text-base leading-relaxed text-[#2D2A24] dark:text-[#E8E4DC]"
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
            className="text-primary mb-3 ml-0.5 text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("acknowledgements")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-base leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("acknowledgementsDesc")}
          </Text>
        </View>

        {/* In Loving Memory Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("memorialTitle")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-base leading-relaxed mb-4"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("memorialDesc")}
          </Text>

          <View className="gap-4">
            {/* Yohannes Ejigu */}
            <View className="border-l-2 border-primary/40 pl-4 py-1">
              <Text
                className="text-lg font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("memorialYohannesTitle")}
              </Text>
              <Text
                className="text-sm text-muted dark:text-muted-dark leading-relaxed mt-1"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {t("memorialYohannesDesc")}
              </Text>
            </View>

            {/* Takele Fekadu */}
            <View className="border-l-2 border-primary/40 pl-4 py-1">
              <Text
                className="text-lg font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("memorialTakeleTitle")}
              </Text>
              <Text
                className="text-sm text-muted dark:text-muted-dark leading-relaxed mt-1"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {t("memorialTakeleDesc")}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact & Feedback Section */}
        <View className="mb-8 px-6">
          <Text
            className="text-primary mb-3 ml-0.5 text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("contactAndFeedback")}
          </Text>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-base leading-relaxed mb-4"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("contactDesc")}
          </Text>

          <View className="gap-3">
            {/* Telegram */}
            <TouchableOpacity
              onPress={() => Linking.openURL("https://t.me/sukkoth").catch(() => {})}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-1"
            >
              <Ionicons name="paper-plane-outline" size={20} color="#3b82f6" />
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {t("telegramContact")}
              </Text>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:suukootj@gmail.com").catch(() => {})}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-1"
            >
              <Ionicons name="mail-outline" size={20} color="#3b82f6" />
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {t("emailContact")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-4 px-6">
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("appTitle")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
