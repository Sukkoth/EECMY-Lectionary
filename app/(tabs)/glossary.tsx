import { SafeAreaView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/lib/i18n";

export default function GlossaryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();

  const topics = [
    {
      icon: "book-outline" as const,
      titleKey: "whatIsLectionary" as const,
      descKey: "whatIsLectionaryDesc" as const,
      route: "/glossary/lectionary",
    },
    {
      icon: "calendar-outline" as const,
      titleKey: "churchYearTitle" as const,
      descKey: "churchYearDesc" as const,
      route: "/glossary/church-year",
    },
    {
      icon: "heart-outline" as const,
      titleKey: "creedsTitle" as const,
      descKey: "creedsDesc" as const,
      route: "/glossary/creeds",
    },
    {
      icon: "hand-left-outline" as const,
      titleKey: "lordsPrayerTitle" as const,
      descKey: "lordsPrayerDesc" as const,
      route: "/glossary/lords-prayer",
    },
  ];

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 pt-12">
        {/* Title */}
        <Text
          className="mb-6 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("reference")}
        </Text>

        {/* Topic Cards */}
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.route}
            onPress={() => router.push(topic.route as Href)}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
          >
            <View className="flex-row items-center gap-4 flex-1 pr-2">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name={topic.icon} size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t(topic.titleKey)}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t(topic.descKey)}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#737373" : "#A3A3A3"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
