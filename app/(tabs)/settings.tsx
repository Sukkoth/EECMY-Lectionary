import {
  Text,
  View,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Appearance,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { formatTimeString } from "@/lib/settings";

export default function SettingsScreen() {
  const isDark = useIsDark();
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();

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
      <ScrollView
        className="flex-1 px-6 pt-12"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          className="mb-6 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("settings")}
        </Text>

        {/* Group 1: Language & Translations */}
        <View className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          {/* App Language */}
          <TouchableOpacity
            onPress={() => router.push("/settings/app-language")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
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

          <View className="h-[1px] bg-stone-200/60 dark:bg-stone-800/60 ml-16" />

          {/* Scripture Language and Version */}
          <TouchableOpacity
            onPress={() => router.push("/settings/language")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
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

          <View className="h-[1px] bg-stone-200/60 dark:bg-stone-800/60 ml-16" />

          {/* Show Full Version Names Toggle */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center gap-4 flex-1 pr-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name="text-outline" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("showFullVersionNames")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-xs leading-relaxed"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("showFullVersionNamesDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showVersionFullName}
              onValueChange={(val) => updateSetting("showVersionFullName", val)}
              trackColor={{ false: isDark ? "#404040" : "#D4D4D4", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Group 2: Display & Appearance */}
        <View className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          {/* Font & Alignment */}
          <TouchableOpacity
            onPress={() => router.push("/settings/font-alignment")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
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

          <View className="h-[1px] bg-stone-200/60 dark:bg-stone-800/60 ml-16" />

          {/* Appearance (Theme) */}
          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center justify-between px-5 py-4 active:opacity-80"
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
              {isDark ? t("darkMode") : t("lightMode")}
            </Text>
          </Pressable>
        </View>

        {/* Group 3: Calendar & Liturgy */}
        <View className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          {/* Calendar System */}
          <TouchableOpacity
            onPress={() => {
              const nextStyle = settings.calendarStyle === "ethiopian" ? "gregorian" : "ethiopian";
              updateSetting("calendarStyle", nextStyle);
            }}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
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

          <View className="h-[1px] bg-stone-200/60 dark:bg-stone-800/60 ml-16" />

          {/* Liturgical Season Colors Toggle */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center gap-4 flex-1 pr-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name="color-palette-outline" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("showSeasonColors")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("showSeasonColorsDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showSeasonColors ?? true}
              onValueChange={(val) => updateSetting("showSeasonColors", val)}
              trackColor={{ false: "#737373", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Group 4: Notifications */}
        <View className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          <TouchableOpacity
            onPress={() => router.push("/settings/daily-reminder")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("dailyReminder")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {settings.reminderEnabled
                    ? formatTimeString(settings.reminderTime || "07:00", settings.timeFormat || "12h")
                    : "Off"}
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

        {/* Group 5: Content Updates */}
        <View className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          <TouchableOpacity
            onPress={() => router.push("/settings/check-updates/content")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
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
                  {t("contentUpdate")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("contentUpdateDesc")}
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

        {/* Group 6: About App */}
        <View className="bg-surface dark:bg-surface-dark mb-8 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50">
          <TouchableOpacity
            onPress={() => router.push("/settings/about")}
            activeOpacity={0.7}
            className="flex-row items-center justify-between px-5 py-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text
                  className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {t("aboutApp")}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("aboutAppDesc")}
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
      </ScrollView>
    </SafeAreaView>
  );
}
