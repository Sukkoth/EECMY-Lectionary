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

type DownloadedVersion = {
  version: string;
  pulledAt: string;
  contentVersion: number;
};

type LangPackStatus = {
  holidays: boolean;
  dayInfo: boolean;
};

type LangPackVersion = {
  year: number;
  language: string;
  type: string;
  contentVersion: number;
};

type Props = {
  year: YearOption;
  selectedLangs: Record<string, string[]>;
  expandedLangs: Record<string, boolean>;
  totalSelectedItems: number;
  onToggleLanguage: (langCode: string, allVersionCodes: string[]) => void;
  onToggleVersion: (langCode: string, versionCode: string) => void;
  onToggleLangPack: (
    langCode: string,
    type?: "holidays" | "dayInfo" | "liturgical",
  ) => void;
  onToggleExpand: (langCode: string) => void;
  onDownload: () => void;
  downloadedVersions?: Record<string, DownloadedVersion[]>;
  downloadedLangPacks?: Record<string, LangPackStatus>;
  syncedLangPackVersions?: LangPackVersion[];
  isDark: boolean;
};

function LangSelectionStep({
  year,
  selectedLangs,
  expandedLangs,
  totalSelectedItems,
  onToggleLanguage,
  onToggleVersion,
  onToggleLangPack,
  onToggleExpand,
  onDownload,
  downloadedVersions = {},
  syncedLangPackVersions = [],
  isDark,
}: Props) {
  const [isStarting, setIsStarting] = useState(false);
  const canProceed = totalSelectedItems > 0;

  const isLangPackSynced = useCallback(
    (
      yearNum: number,
      langCode: string,
      type: "holidays" | "dayInfo",
      manifestVersion: number,
    ) => {
      if (manifestVersion <= 0) return true;
      const record = syncedLangPackVersions.find(
        (r) =>
          r.year === yearNum &&
          r.language === langCode &&
          r.type === (type === "holidays" ? "holidays" : "day-info"),
      );
      return !!record && record.contentVersion >= manifestVersion;
    },
    [syncedLangPackVersions],
  );

  const handleDownloadPress = useCallback(() => {
    if (!canProceed || isStarting) return;
    setIsStarting(true);
    setTimeout(() => {
      onDownload();
    }, 300);
  }, [canProceed, isStarting, onDownload]);

  const availableLanguages = year.languages.filter((lang) => {
    const downloaded = downloadedVersions[lang.code];
    const hasUnsyncedVersions =
      !downloaded || downloaded.length < lang.versions.length;
    const holidaysSynced = isLangPackSynced(
      year.year,
      lang.code,
      "holidays",
      lang.holidays?.version ?? 0,
    );
    const dayInfoSynced = isLangPackSynced(
      year.year,
      lang.code,
      "dayInfo",
      lang.dayInfo?.version ?? 0,
    );
    const hasUnsyncedPack = !holidaysSynced || !dayInfoSynced;
    return hasUnsyncedVersions || hasUnsyncedPack;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Selected Year Header Card */}
      <View className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4">
        <View className="flex-row items-center gap-3">
          <View className="rounded-lg bg-primary/10 p-2">
            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
          </View>
          <View>
            <Text
              className="text-xs text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Target Year
            </Text>
            <Text
              className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              Liturgical Year {year.year}
            </Text>
          </View>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text
            className="text-xs text-primary font-semibold"
            style={{ fontFamily: "ReadingFont" }}
          >
            {year.languages.length} {year.languages.length === 1 ? "Lang" : "Langs"}
          </Text>
        </View>
      </View>

      {/* Section Label */}
      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text
          className="text-xs uppercase tracking-widest text-primary font-semibold"
          style={{ fontFamily: "ReadingFont" }}
        >
          Select Content Packages
        </Text>
      </View>

      {availableLanguages.map((lang) => {
        const isExpanded = expandedLangs[lang.code] ?? false;
        const selectedVersions = selectedLangs[lang.code] ?? [];
        const readingSelections = selectedVersions.filter(
          (v) => !v.startsWith("__"),
        );
        const allSelected = readingSelections.length === lang.versions.length;
        const someSelected = selectedVersions.length > 0 && !allSelected;

        return (
          <View key={lang.code} className="mb-3">
            <View
              className={`bg-surface dark:bg-surface-dark flex-row items-center justify-between rounded-2xl px-5 py-4 border ${
                allSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-transparent"
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
                  color={isDark ? "#8a8480" : "#6b6560"}
                />
                <View className="flex-1">
                  <Text
                    className={`text-base ${
                      allSelected
                        ? "text-primary"
                        : "text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                    style={{
                      fontFamily: "ReadingFont",
                      fontWeight: allSelected ? "600" : "500",
                    }}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    className="text-xs text-muted dark:text-muted-dark mt-0.5"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    {lang.versions.length}{" "}
                    {lang.versions.length === 1 ? "version" : "versions"} available
                    {selectedVersions.length > 0 &&
                      ` · ${selectedVersions.length} selected`}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  onToggleLanguage(
                    lang.code,
                    lang.versions.map((v) => v.code),
                  )
                }
                activeOpacity={0.7}
                className="p-1"
              >
                {allSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                ) : someSelected ? (
                  <View className="h-6 w-6 items-center justify-center rounded border-2 border-primary">
                    <View className="h-2.5 w-2.5 rounded-sm bg-primary" />
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
              <View className="ml-3 mt-2 border-l-2 border-primary/20 pl-3">
                {/* Bible Versions Header */}
                <Text
                  className="mb-1 mt-2 text-[11px] font-semibold tracking-wider text-muted dark:text-muted-dark uppercase"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  Bible Versions
                </Text>

                {lang.versions.map((version) => {
                  const isSelected = selectedVersions.includes(version.code);
                  const downloaded = downloadedVersions[lang.code]?.find(
                    (d) => d.version === version.code,
                  );

                  return (
                    <TouchableOpacity
                      key={version.code}
                      onPress={() => onToggleVersion(lang.code, version.code)}
                      activeOpacity={0.7}
                      className={`my-1 flex-row items-center gap-3 rounded-xl px-3.5 py-3 ${
                        isSelected
                          ? "bg-primary/10"
                          : "bg-surface/50 dark:bg-surface-dark/50"
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
                          className={`text-sm ${
                            isSelected
                              ? "text-primary font-semibold"
                              : "text-[#2D2A24] dark:text-[#E8E4DC] font-normal"
                          }`}
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {version.name} ({version.code.toUpperCase()})
                        </Text>
                        <View className="mt-0.5 flex-row items-center gap-2">
                          <Text
                            className="text-xs text-muted dark:text-muted-dark"
                            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                          >
                            {version.contentVersion > 0
                              ? `v${version.contentVersion}`
                              : "Available"}
                          </Text>
                          {downloaded &&
                            downloaded.contentVersion >=
                              version.contentVersion && (
                              <View className="rounded-full bg-green-500/15 px-1.5 py-0.5">
                                <Text
                                  className="text-[10px] text-green-600 dark:text-green-400"
                                  style={{
                                    fontFamily: "ReadingFont",
                                    fontWeight: "600",
                                  }}
                                >
                                  Synced
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Additional Packs Header */}
                <Text
                  className="mb-1 mt-3 text-[11px] font-semibold tracking-wider text-muted dark:text-muted-dark uppercase"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  Liturgical Data Pack
                </Text>

                {(() => {
                  const holidaysSynced = isLangPackSynced(
                    year.year,
                    lang.code,
                    "holidays",
                    lang.holidays?.version ?? 0,
                  );
                  const dayInfoSynced = isLangPackSynced(
                    year.year,
                    lang.code,
                    "dayInfo",
                    lang.dayInfo?.version ?? 0,
                  );
                  const isSynced = holidaysSynced && dayInfoSynced;

                  const isSelected =
                    (selectedLangs[lang.code] ?? []).includes("__holidays__") ||
                    (selectedLangs[lang.code] ?? []).includes("__dayinfo__");

                  return (
                    <TouchableOpacity
                      onPress={() => onToggleLangPack(lang.code, "liturgical")}
                      activeOpacity={0.7}
                      className={`my-1 flex-row items-center gap-3 rounded-xl px-3.5 py-3 ${
                        isSelected
                          ? "bg-primary/10"
                          : "bg-surface/50 dark:bg-surface-dark/50"
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
                          className={`text-sm ${
                            isSelected
                              ? "text-primary font-semibold"
                              : "text-[#2D2A24] dark:text-[#E8E4DC] font-normal"
                          }`}
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          Liturgical Data Pack
                        </Text>
                        <View className="mt-0.5 flex-row items-center gap-2">
                          <Text
                            className="text-xs text-muted dark:text-muted-dark"
                            style={{
                              fontFamily: "ReadingFont",
                              fontWeight: "400",
                            }}
                          >
                            Holidays, Feasts & Daily Info
                          </Text>
                          {isSynced && (
                            <View className="rounded-full bg-green-500/15 px-1.5 py-0.5">
                              <Text
                                className="text-[10px] text-green-600 dark:text-green-400"
                                style={{
                                  fontFamily: "ReadingFont",
                                  fontWeight: "600",
                                }}
                              >
                                Synced
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })()}
              </View>
            )}
          </View>
        );
      })}

      {/* Selected Items Summary Card */}
      <View className="bg-surface dark:bg-surface-dark mb-4 mt-2 flex-row items-center justify-between rounded-2xl px-5 py-3.5">
        <Text
          className="text-sm text-muted dark:text-muted-dark"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Selected Packages
        </Text>
        <Text
          className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {totalSelectedItems} {totalSelectedItems === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={handleDownloadPress}
        disabled={!canProceed || isStarting}
        activeOpacity={0.7}
        className={`mb-8 flex-row items-center justify-center gap-2 rounded-xl py-4 shadow-sm ${
          canProceed && !isStarting
            ? "bg-primary"
            : "bg-stone-300 dark:bg-stone-700"
        }`}
      >
        {isStarting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons
            name="download-outline"
            size={20}
            color={canProceed ? "white" : isDark ? "#8a8480" : "#a8a29e"}
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
              ? `Download ${totalSelectedItems} ${totalSelectedItems === 1 ? "Item" : "Items"}`
              : "Select Items to Download"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default LangSelectionStep;
