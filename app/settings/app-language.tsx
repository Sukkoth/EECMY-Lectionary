import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";

export default function AppLanguageSettingsScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();

  const APP_LANGUAGES = [
    { code: "am", label: "አማርኛ", native: "Amharic" },
    { code: "en", label: "English", native: "English" },
    { code: "om", label: "Afaan Oromoo", native: "Oromo" },
  ] as const;

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Header with back button */}
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
            className="text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("appLanguage")}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 24, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-surface dark:bg-surface-dark rounded-2xl border border-stone-200/60 dark:border-stone-800/60 p-2">
          {APP_LANGUAGES.map((lang, index) => {
            const isSelected = settings.appLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => {
                  updateSetting("appLanguage", lang.code);
                  router.back();
                }}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  index < APP_LANGUAGES.length - 1 ? "border-b border-stone-200/40 dark:border-stone-800/40" : ""
                }`}
              >
                <View>
                  <Text
                    className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {lang.label}
                  </Text>
                  <Text
                    className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {lang.native}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
