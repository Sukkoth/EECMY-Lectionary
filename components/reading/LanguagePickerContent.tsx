import { useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";

type LanguagePickerContentProps = {
  onVersionSelect?: () => void;
  hideHeader?: boolean;
};

export default function LanguagePickerContent({
  onVersionSelect,
  hideHeader,
}: LanguagePickerContentProps) {
  const isDark = useColorScheme() === "dark";
  const { settings, setAllSettings, availableLanguages, languagesError } =
    useSettings();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const selected = availableLanguages.find(
      (l) => l.code === settings.language,
    );
    return selected ? { [selected.language]: true } : {};
  });

  const toggleLanguage = (language: string) => {
    setExpanded((prev) => ({ ...prev, [language]: !prev[language] }));
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
    onVersionSelect?.();
  };

  return (
    <View className="px-6">
      {/* Header */}
      {!hideHeader && (
        <View className="mb-5 items-center justify-center">
          <Text
            className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
            style={{ fontFamily: "ReadingFont" }}
          >
            Language & Version
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-center text-xs font-normal"
            style={{ fontFamily: "ReadingFont" }}
          >
            Select your preferred Bible translation
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

      {/* Empty state */}
      {!languagesError && availableLanguages.length === 0 && (
        <View className="bg-surface dark:bg-surface-dark rounded-2xl p-6 items-center justify-center border border-stone-200/50 dark:border-stone-800/50">
          <Ionicons name="book-outline" size={24} color="#6b6560" />
          <Text
            className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
            style={{ fontFamily: "ReadingFont" }}
          >
            No translations available yet
          </Text>
        </View>
      )}

      {/* Language Group Cards */}
      {availableLanguages.map((lang) => {
        const isExpanded = expanded[lang.language] ?? false;
        const activeVersion = lang.versions.find(
          (v) =>
            settings.language === lang.code && settings.version === v.code,
        );

        return (
          <View
            key={lang.language}
            className="will-change-variable bg-surface dark:bg-surface-dark rounded-2xl border border-stone-200/60 dark:border-stone-800/60 p-4 mb-3"
          >
            {/* Language Header Card */}
            <TouchableOpacity
              onPress={() => toggleLanguage(lang.language)}
              activeOpacity={0.75}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2.5 flex-1">
                <Text
                  className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC] uppercase tracking-wider"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {lang.language}
                </Text>

                {activeVersion && (
                  <View className="bg-primary/10 rounded-full px-2.5 py-0.5">
                    <Text
                      className="text-[10px] text-primary font-semibold uppercase tracking-wider"
                      style={{ fontFamily: "ReadingFont" }}
                    >
                      {activeVersion.code} Active
                    </Text>
                  </View>
                )}
              </View>

              <View className="bg-bg-warm dark:bg-bg-warm-dark rounded-full p-1.5 border border-stone-200/40 dark:border-stone-800/40">
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={isDark ? "#E8E4DC" : "#2D2A24"}
                />
              </View>
            </TouchableOpacity>

            {/* Version Options Container */}
            {isExpanded && (
              <View className="mt-3 pt-3 border-t border-stone-200/40 dark:border-stone-800/40 space-y-1.5">
                {lang.versions.map((version) => {
                  const isActive =
                    settings.language === lang.code &&
                    settings.version === version.code;

                  return (
                    <TouchableOpacity
                      key={version.code}
                      onPress={() =>
                        handleVersionSelect(lang.code, version.code)
                      }
                      activeOpacity={0.7}
                      className={`flex-row items-center justify-between rounded-xl p-3.5 my-1 ${
                        isActive
                          ? "bg-primary/10 border border-primary/40"
                          : "bg-bg-warm/50 dark:bg-bg-warm-dark/50 border border-stone-200/40 dark:border-stone-800/40"
                      }`}
                    >
                      <View className="flex-1 flex-row items-center gap-3">
                        {isActive ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#3b82f6"
                          />
                        ) : (
                          <View className="h-4 w-4 rounded-full border border-stone-300 dark:border-stone-700" />
                        )}
                        <Text
                          className={`text-base ${
                            isActive
                              ? "text-primary font-semibold"
                              : "text-[#2D2A24] dark:text-[#E8E4DC] font-medium"
                          }`}
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {version.label}
                        </Text>
                      </View>

                      <Text
                        className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted dark:text-muted-dark opacity-70"
                        }`}
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {version.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
