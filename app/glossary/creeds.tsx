import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme, LayoutAnimation, Platform, UIManager } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";
import { GLOSSARY_CONTENT, type GlossaryLanguage } from "@/lib/glossary-content";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CreedsScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings } = useSettings();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const lang = settings.language as GlossaryLanguage;
  const content = GLOSSARY_CONTENT[lang] ?? GLOSSARY_CONTENT.en;

  const handleToggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="border-b border-stone-200 px-6 pb-4 pt-10 dark:border-stone-800">
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
            {content.creeds.title}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {content.creeds.creeds.map((creed, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark mb-4 mx-6 rounded-2xl px-5 py-4"
            onPress={() => handleToggle(index)}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[#2D2A24] dark:text-[#E8E4DC] text-xl"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {creed.name}
              </Text>
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDark ? "#737373" : "#A3A3A3"}
              />
            </View>

            <Text
              className="text-muted dark:text-muted-dark mt-2 text-xl"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {creed.introduction}
            </Text>

            {expandedIndex === index && (
              <>
                <View className="border-b border-stone-200 dark:border-stone-800 my-4" />
                <Text
                  className="text-[#2D2A24] dark:text-[#E8E4DC] text-2xl leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {creed.text}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
