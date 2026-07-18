import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { YearOption } from "../../app/settings/check-updates/types";

type Props = {
  year: YearOption;
  selectedLangs: Record<string, string[]>;
  expandedLangs: Record<string, boolean>;
  totalSelectedItems: number;
  onToggleLanguage: (langCode: string, allVersionCodes: string[]) => void;
  onToggleVersion: (langCode: string, versionCode: string) => void;
  onToggleExpand: (langCode: string) => void;
  onDownload: () => void;
  isDark: boolean;
};

function LangSelectionStep({
  year,
  selectedLangs,
  expandedLangs,
  totalSelectedItems,
  onToggleLanguage,
  onToggleVersion,
  onToggleExpand,
  onDownload,
  isDark,
}: Props) {
  const [isStarting, setIsStarting] = useState(false);
  const canProceed = totalSelectedItems > 0;

  const handleDownloadPress = useCallback(() => {
    if (!canProceed || isStarting) return;
    setIsStarting(true);
    setTimeout(() => {
      onDownload();
    }, 300);
  }, [canProceed, isStarting, onDownload]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="bg-surface dark:bg-surface-dark mb-5 rounded-2xl px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Selected Year
          </Text>
          <Text
            className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {year.year} · v{year.version}
          </Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Last Updated
          </Text>
          <Text
            className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
          >
            {year.lastUpdated}
          </Text>
        </View>
      </View>

      <Text className="text-primary mb-3 ml-1 mt-2 text-xs uppercase tracking-widest"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}>
        SELECT CONTENT
      </Text>

      {year.languages.map((lang) => {
        const isExpanded = expandedLangs[lang.code] ?? false;
        const selectedVersions = selectedLangs[lang.code] ?? [];
        const allSelected = selectedVersions.length === lang.versions.length;
        const someSelected =
          selectedVersions.length > 0 && !allSelected;

        return (
          <View key={lang.code} className="mb-3">
            <View
              className={`flex-row items-center justify-between rounded-2xl px-5 py-4 ${
                allSelected
                  ? "bg-primary/8 border-2 border-primary/20"
                  : "bg-surface dark:bg-surface-dark border-2 border-transparent"
              }`}
            >
              <TouchableOpacity
                onPress={() => onToggleExpand(lang.code)}
                activeOpacity={0.7}
                className="flex-1 flex-row items-center gap-3"
              >
                <Ionicons
                  name={isExpanded ? "chevron-down" : "chevron-forward"}
                  size={16}
                  color={isDark ? "#737373" : "#A3A3A3"}
                />
                <View>
                  <Text
                    className={`text-base ${allSelected ? "text-primary" : "text-[#2D2A24] dark:text-[#E8E4DC]"}`}
                    style={{
                      fontFamily: "ReadingFont",
                      fontWeight: allSelected ? "600" : "500",
                    }}
                  >
                    {lang.name}
                  </Text>
                  {someSelected && (
                    <Text
                      className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                      style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                    >
                      {selectedVersions.length} of {lang.versions.length} selected
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onToggleLanguage(lang.code, lang.versions.map((v) => v.code))}
                activeOpacity={0.7}
                className="p-1"
              >
                {allSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                ) : someSelected ? (
                  <View className="h-6 w-6 items-center justify-center rounded border-2 border-primary">
                    <View className="bg-primary h-2.5 w-2.5 rounded-sm" />
                  </View>
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={24}
                    color={isDark ? "#8a8480" : "#6b6560"}
                  />
                )}
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <View className="mt-2 pl-4">
                {lang.versions.map((version) => {
                  const isSelected = selectedVersions.includes(version.code);

                  return (
                    <TouchableOpacity
                      key={version.code}
                      onPress={() => onToggleVersion(lang.code, version.code)}
                      activeOpacity={0.7}
                      className={`flex-row items-center gap-3 my-1 rounded-xl px-4 py-3 ${
                        isSelected
                          ? "bg-primary/8"
                          : ""
                      }`}
                    >
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#3b82f6"
                        />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={20}
                          color={isDark ? "#8a8480" : "#6b6560"}
                        />
                      )}

                      <View className="flex-1">
                        <Text
                          className={`text-sm ${isSelected ? "text-primary" : "text-[#2D2A24] dark:text-[#E8E4DC]"}`}
                          style={{
                            fontFamily: "ReadingFont",
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          {version.label}
                        </Text>
                        <Text
                          className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                        >
                          {version.code.toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      <View className="mt-4 mb-4 flex-row items-center justify-between rounded-2xl bg-primary/5 px-5 py-3">
        <Text
          className="text-muted dark:text-muted-dark text-sm"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Selected
        </Text>
        <Text
          className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {totalSelectedItems} {totalSelectedItems === 1 ? "item" : "items"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleDownloadPress}
        disabled={!canProceed || isStarting}
        activeOpacity={0.7}
        className={`mb-8 flex-row items-center justify-center gap-2 rounded-xl py-4 ${
          canProceed && !isStarting
            ? "bg-primary"
            : "bg-stone-300 dark:bg-stone-600"
        }`}
      >
        {isStarting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons
            name="download-outline"
            size={20}
            color={canProceed ? "white" : isDark ? "#8a8580" : "#a8a29e"}
          />
        )}
        <Text
          className={`text-center text-base ${
            canProceed && !isStarting
              ? "text-white"
              : "text-stone-400 dark:text-stone-500"
          }`}
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {isStarting
            ? "Preparing Download…"
            : canProceed
              ? `Download ${totalSelectedItems} ${totalSelectedItems === 1 ? "Item" : "Items"} · ${year.size}`
              : "Select Items to Download"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default LangSelectionStep;
