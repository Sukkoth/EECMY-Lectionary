import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/SettingsContext";
import { GLOSSARY_CONTENT, type GlossaryLanguage } from "@/lib/glossary-content";

export default function LordsPrayerScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings } = useSettings();

  const lang = (settings.appLanguage || settings.language) as GlossaryLanguage;
  const content = GLOSSARY_CONTENT[lang] ?? GLOSSARY_CONTENT.en;

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="border-b border-stone-200 px-6 pb-4 pt-12 dark:border-stone-800">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {content.lordsPrayer.title}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-[#2D2A24] dark:text-[#E8E4DC] mb-6 px-6 text-base leading-relaxed"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {content.lordsPrayer.introduction}
        </Text>

        <View className="bg-surface dark:bg-surface-dark mx-6 rounded-2xl px-6 py-6">
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-center text-lg leading-loose whitespace-pre-line"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {content.lordsPrayer.text}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
