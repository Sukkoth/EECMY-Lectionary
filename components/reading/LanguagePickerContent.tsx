import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useSettings } from "@/lib/SettingsContext";
import { useOnboarding } from "@/lib/OnboardingContext";
import { useTranslation } from "@/lib/i18n";
import { scheduleDailyReminder } from "@/lib/NotificationService";

type LanguagePickerContentProps = {
  onVersionSelect?: () => void;
  hideHeader?: boolean;
};

export default function LanguagePickerContent({
  onVersionSelect,
  hideHeader,
}: LanguagePickerContentProps) {
  const isDark = useColorScheme() === "dark";
  const { t } = useTranslation();
  const { settings, setAllSettings, availableLanguages, languagesError } =
    useSettings();
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();
  const db = useSQLiteContext();

  const handleDownloadContent = async () => {
    if (!isOnboardingComplete) {
      await completeOnboarding();
    }
    router.push("/settings/check-updates/content");
  };

  const handleVersionSelect = async (
    langCode: string,
    versionCode: string,
  ) => {
    await setAllSettings({
      ...settings,
      language: langCode,
      version: versionCode,
    });

    if (settings.reminderEnabled) {
      const [hStr, mStr] = (settings.reminderTime || "07:00").split(":");
      const hour = parseInt(hStr, 10) || 7;
      const minute = parseInt(mStr, 10) || 0;
      await scheduleDailyReminder(
        hour,
        minute,
        db,
        langCode,
        versionCode,
        t("appTitle"),
        30,
      );
    }

    onVersionSelect?.();
  };

  // Flatten all available versions across all languages into a unified list
  const allVersions = availableLanguages.flatMap((lang) =>
    lang.versions.map((ver) => ({
      langCode: lang.code,
      langName: lang.language,
      versionCode: ver.code,
      versionLabel: ver.label,
    })),
  );

  return (
    <View className="px-6 pb-2">
      {/* Header */}
      {!hideHeader && (
        <View className="mb-5 items-center justify-center">
          <Text
            className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("scriptureLanguageAndVersion")}
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-center text-xs font-normal"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("selectBibleTranslation")}
          </Text>
        </View>
      )}

      {/* Error state */}
      {languagesError && (
        <View className="bg-red-500/10 rounded-2xl p-4 mb-4 border border-red-500/20">
          <Text
            className="text-red-500 dark:text-red-400 text-center text-sm"
            style={{ fontFamily: "ReadingFont" }}
          >
            {languagesError}
          </Text>
        </View>
      )}

      {/* Empty state with Download + Skip buttons */}
      {!languagesError && availableLanguages.length === 0 && (
        <View className="bg-surface dark:bg-surface-dark rounded-3xl p-6 items-center justify-center border border-stone-200/60 dark:border-stone-800/60">
          <View className="bg-primary/10 rounded-2xl p-4 mb-3">
            <Ionicons name="cloud-download-outline" size={28} color="#3b82f6" />
          </View>
          <Text
            className="text-[#2D2A24] dark:text-[#E8E4DC] text-center text-lg font-semibold mb-1"
            style={{ fontFamily: "ReadingFont" }}
          >
            No Translations Installed
          </Text>
          <Text
            className="text-muted dark:text-muted-dark text-center text-xs mb-5 px-2"
            style={{ fontFamily: "ReadingFont" }}
          >
            Download a scripture content pack to start reading your daily lectionary.
          </Text>

          {/* Primary Action: Download Content Pack */}
          <TouchableOpacity
            onPress={handleDownloadContent}
            activeOpacity={0.8}
            className="w-full bg-primary rounded-xl py-3.5 items-center justify-center flex-row gap-2 mb-3"
          >
            <Ionicons name="cloud-download" size={18} color="#ffffff" />
            <Text
              className="text-white text-sm font-semibold"
              style={{ fontFamily: "ReadingFont" }}
            >
              Download Content Pack
            </Text>
          </TouchableOpacity>

          {/* Secondary Action: Continue without downloading */}
          {onVersionSelect && (
            <TouchableOpacity
              onPress={onVersionSelect}
              activeOpacity={0.7}
              className="py-2 px-4"
            >
              <Text
                className="text-muted dark:text-muted-dark text-xs font-medium underline"
                style={{ fontFamily: "ReadingFont" }}
              >
                Skip for now — Continue to App
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Unified Vertical Translation List across All Languages */}
      {allVersions.length > 0 && (
        <View className="space-y-2">
          {allVersions.map((item) => {
            const isActive =
              settings.language === item.langCode &&
              settings.version === item.versionCode;

            return (
              <TouchableOpacity
                key={`${item.langCode}-${item.versionCode}`}
                onPress={() =>
                  handleVersionSelect(item.langCode, item.versionCode)
                }
                activeOpacity={0.75}
                className={`flex-row items-center justify-between rounded-2xl p-4 my-1 border transition-all ${
                  isActive
                    ? "bg-surface dark:bg-surface-dark border-primary/60"
                    : "bg-surface dark:bg-surface-dark border-stone-200/60 dark:border-stone-800/60 opacity-80"
                }`}
              >
                <View className="flex-1 flex-row items-center gap-3.5 pr-2">
                  <View className="h-9 w-9 rounded-full items-center justify-center bg-stone-200/50 dark:bg-stone-800/50">
                    <Ionicons
                      name="book-outline"
                      size={18}
                      color={isActive ? "#3b82f6" : isDark ? "#A8A29E" : "#78716C"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-[#2D2A24] dark:text-[#E8E4DC] text-base font-semibold"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.versionLabel}
                    </Text>

                    <Text
                      className="text-muted dark:text-muted-dark text-xs mt-0.5"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.langName}
                    </Text>
                  </View>
                </View>

                {/* Right side: Version Code Badge + Native Checkmark Icon */}
                <View className="flex-row items-center gap-2.5">
                  <View
                    className={`px-2.5 py-1 rounded-lg border ${
                      isActive
                        ? "bg-primary/10 border-primary/25"
                        : "bg-bg-warm/80 dark:bg-bg-warm-dark/80 border-stone-200/50 dark:border-stone-800/50"
                    }`}
                  >
                    <Text
                      className={`text-[11px] uppercase font-semibold ${
                        isActive
                          ? "text-primary"
                          : "text-muted dark:text-muted-dark opacity-70"
                      }`}
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {item.versionCode}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
