import { forwardRef, useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

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

  const toggleLanguage = (language: string) => {
    setExpanded((prev) => ({ ...prev, [language]: !prev[language] }));
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
            className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
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
                  className="text-primary text-md uppercase tracking-widest"
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
                lang.versions.map((version) => (
                  <TouchableOpacity
                    key={version.code}
                    onPress={() => {
                      console.log(`Language selected: ${version.code} — ${version.label}`);
                      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between py-4"
                  >
                    <Text
                      className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
                      style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                    >
                      {version.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDark ? "#737373" : "#A3A3A3"}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

LanguageSwitcherSheet.displayName = "LanguageSwitcherSheet";

export default LanguageSwitcherSheet;
