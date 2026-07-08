import { useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";
import { LANGUAGES } from "@/lib/languages";

type LanguagePickerContentProps = {
  onVersionSelect?: () => void;
};

export default function LanguagePickerContent({ onVersionSelect }: LanguagePickerContentProps) {
  const isDark = useColorScheme() === "dark";
  const { settings, setAllSettings } = useSettings();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleLanguage = (language: string) => {
    setExpanded((prev) => ({ ...prev, [language]: !prev[language] }));
  };

  const handleVersionSelect = async (langCode: string, versionCode: string) => {
    await setAllSettings({ language: langCode, version: versionCode });
    onVersionSelect?.();
  };

  return (
    <>
      {/* Header */}
      <View className="px-6 pb-4">
        <Text
          className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Select Language & Version
        </Text>
        <Text
          className="text-muted dark:text-muted-dark mt-1 text-center text-sm"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Choose your preferred Bible translation
        </Text>
      </View>

      {/* Language groups */}
      {LANGUAGES.map((lang) => {
        const isExpanded = expanded[lang.language] ?? false;

        return (
          <View key={lang.language} className="px-6">
            {/* Language header — tappable to expand/collapse */}
            <TouchableOpacity
              onPress={() => toggleLanguage(lang.language)}
              activeOpacity={0.7}
              className="border-b border-stone-200 flex-row items-center justify-between pb-2 pt-4 dark:border-stone-700"
            >
              <Text
                className="text-primary text-xs uppercase tracking-widest"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {lang.language}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={isDark ? "#737373" : "#A3A3A3"}
              />
            </TouchableOpacity>

            {/* Version rows — only when expanded */}
            {isExpanded &&
              lang.versions.map((version) => {
                const isActive =
                  settings.language === lang.code && settings.version === version.code;

                return (
                  <TouchableOpacity
                    key={version.code}
                    onPress={() => handleVersionSelect(lang.code, version.code)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between py-4"
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                      )}
                      <Text
                        className={`text-base ${
                          isActive
                            ? "text-primary font-semibold"
                            : "text-[#2D2A24] dark:text-[#E8E4DC]"
                        }`}
                        style={{
                          fontFamily: "ReadingFont",
                          fontWeight: isActive ? "600" : "400",
                        }}
                      >
                        {version.label}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDark ? "#737373" : "#A3A3A3"}
                    />
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      })}
    </>
  );
}
