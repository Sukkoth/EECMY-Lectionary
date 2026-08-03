import { Text, View, TouchableOpacity, useColorScheme, Pressable, SafeAreaView, Appearance } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { settings, updateSetting } = useSettings();
  const { t, lang } = useTranslation();

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    updateSetting("theme", newTheme);
    Appearance.setColorScheme(newTheme);
  };

  const getLanguageLabel = () => {
    const appLang = settings.appLanguage || settings.language;
    if (appLang === "en") return "English";
    if (appLang === "om") return "Afaan Oromoo";
    return "አማርኛ";
  };

  const getScriptureLangLabel = () => {
    if (settings.language === "en") return "English";
    if (settings.language === "om") return "Afaan Oromoo";
    return "አማርኛ";
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 pt-12">
        {/* Title */}
        <Text
          className="mb-6 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("settings")}
        </Text>

        {/* App Language Settings Row */}
        <TouchableOpacity
          onPress={() => router.push("/settings/app-language")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="globe-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("appLanguage")}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {getLanguageLabel()}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#737373" : "#A3A3A3"}
          />
        </TouchableOpacity>

        {/* Bible Translation Content & Version */}
        <TouchableOpacity
          onPress={() => router.push("/settings/language")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="language-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("scriptureLanguageAndVersion")}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {getScriptureLangLabel()} — {settings.version.toUpperCase()}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#737373" : "#A3A3A3"}
          />
        </TouchableOpacity>

        {/* Font & Alignment */}
        <TouchableOpacity
          onPress={() => router.push("/settings/font-alignment")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="text-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("fontAndAlignment")}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {settings.fontSizeSimple}/{settings.fontSizeExpanded}px — {settings.alignSimple}/{settings.alignExpanded}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#737373" : "#A3A3A3"}
          />
        </TouchableOpacity>

        {/* Calendar System */}
        <TouchableOpacity
          onPress={() => {
            const nextStyle = settings.calendarStyle === "ethiopian" ? "gregorian" : "ethiopian";
            updateSetting("calendarStyle", nextStyle);
          }}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("calendarSystem")}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {settings.calendarStyle === "ethiopian"
                  ? t("ethiopianEC")
                  : t("gregorianGC")}
              </Text>
            </View>
          </View>
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {settings.calendarStyle === "ethiopian" ? t("ethiopian") : t("gregorian")}
          </Text>
        </TouchableOpacity>

        {/* Appearance */}
        <View className="bg-surface dark:bg-surface-dark rounded-2xl px-5 py-4">
          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-4">
              <View className="rounded-lg p-2" style={{ backgroundColor: isDark ? "#3b82f620" : "#FEF3C7" }}>
                <Ionicons
                  name={isDark ? "moon-outline" : "sunny-outline"}
                  size={20}
                  color={isDark ? "#3b82f6" : "#D97706"}
                />
              </View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("appearance")}
              </Text>
            </View>
            <Text
              className="text-muted dark:text-muted-dark text-sm capitalize"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {colorScheme === "dark" ? t("darkMode") : t("lightMode")}
            </Text>
          </Pressable>
        </View>

        {/* Check for Updates */}
        <Text
          className="text-primary mb-3 ml-1 mt-6 text-xs uppercase tracking-widest"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("updates")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/settings/check-updates")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-8 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="rounded-lg p-2" style={{ backgroundColor: isDark ? "#16a34a20" : "#DCFCE7" }}>
              <Ionicons name="cloud-download-outline" size={20} color="#16a34a" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("checkUpdates")}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {t("appAndContentUpdates")}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#737373" : "#A3A3A3"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
