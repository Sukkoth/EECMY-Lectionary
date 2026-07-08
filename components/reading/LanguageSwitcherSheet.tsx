import { forwardRef, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { loadLanguageSetting, saveLanguageSetting } from "@/lib/settings";

const LANGUAGES = [
  {
    language: "English",
    versions: [
      { code: "kjv", label: "King James Version" },
      { code: "niv", label: "New International Version" },
    ],
  },
  {
    language: "አማርኛ",
    versions: [
      { code: "am54", label: "አማርኛ 1954" },
      { code: "nasv", label: "NASV" },
    ],
  },
];

const LanguageSwitcherSheet = forwardRef<BottomSheetModal>((_props, ref) => {
  const isDark = useColorScheme() === "dark";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);

  useEffect(() => {
    loadLanguageSetting().then((setting) => {
      if (setting) {
        setActiveLanguage(setting.language);
        setActiveVersion(setting.version);
      }
    });
  }, []);

  const toggleLanguage = (language: string) => {
    setExpanded((prev) => ({ ...prev, [language]: !prev[language] }));
  };

  const handleVersionSelect = async (language: string, code: string) => {
    setActiveLanguage(language);
    setActiveVersion(code);
    await saveLanguageSetting({ language, version: code });
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["50%"]}
      backgroundStyle={{
        backgroundColor: isDark ? "#1C1C1C" : "#FFFFFF",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#525252" : "#D4D4D4",
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
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
                    activeLanguage === lang.language && activeVersion === version.code;

                  return (
                    <TouchableOpacity
                      key={version.code}
                      onPress={() => handleVersionSelect(lang.language, version.code)}
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

LanguageSwitcherSheet.displayName = "LanguageSwitcherSheet";

export default LanguageSwitcherSheet;
