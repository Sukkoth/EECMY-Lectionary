import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { YearOption } from "@/lib/types/checkUpdates";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
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
          r.language.toLowerCase() === langCode.toLowerCase() &&
          r.type === (type === "holidays" ? "holidays" : "day-info"),
      );
      return !!record && record.contentVersion >= manifestVersion;
    },
    [syncedLangPackVersions],
  );

  const isVersionSynced = useCallback(
    (langCode: string, version: { code: string; contentVersion: number }) => {
      const langVersions = Object.entries(downloadedVersions).find(
        ([lCode]) => lCode.toLowerCase() === langCode.toLowerCase()
      )?.[1] ?? [];
      const downloaded = langVersions.find(
        (d) => d.version.toLowerCase() === version.code.toLowerCase(),
      );
      return !!downloaded && downloaded.contentVersion >= version.contentVersion;
    },
    [downloadedVersions],
  );

  const isLiturgicalSynced = useCallback(
    (lang: (typeof year.languages)[0]) => {
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
      return holidaysSynced && dayInfoSynced;
    },
    [isLangPackSynced, year.year],
  );

  const handleDownloadPress = useCallback(() => {
    if (!canProceed || isStarting) return;
    setIsStarting(true);
    setTimeout(() => {
      onDownload();
    }, 300);
  }, [canProceed, isStarting, onDownload]);

  const yearAllSynced = year.languages.every(
    (lang) =>
      isLiturgicalSynced(lang) &&
      lang.versions.every((v) => isVersionSynced(lang.code, v)),
  );

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
          Content Packages
        </Text>
      </View>

      {year.languages.map((lang) => {
        const isExpanded = expandedLangs[lang.code] ?? false;
        const selectedVersions = selectedLangs[lang.code] ?? [];

        const unsyncedVersions = lang.versions.filter(
          (v) => !isVersionSynced(lang.code, v),
        );
        const unsyncedVersionCodes = unsyncedVersions.map((v) => v.code);
        const liturgicalSynced = isLiturgicalSynced(lang);
        const hasUnsyncedLiturgical = !liturgicalSynced;
        const langAllSynced =
          unsyncedVersionCodes.length === 0 && !hasUnsyncedLiturgical;

        let langUpdateCount = 0;
        let langAvailableCount = 0;

        const langVersions = Object.entries(downloadedVersions).find(
          ([lCode]) => lCode.toLowerCase() === lang.code.toLowerCase()
        )?.[1] ?? [];

        lang.versions.forEach((v) => {
          const downloaded = langVersions.find(
            (d) => d.version.toLowerCase() === v.code.toLowerCase(),
          );
          if (!downloaded) {
            langAvailableCount++;
          } else if (downloaded.contentVersion < v.contentVersion) {
            langUpdateCount++;
          }
        });

        if (hasUnsyncedLiturgical) {
          const holidaysRecord = syncedLangPackVersions.find(
            (r) =>
              r.year === year.year &&
              r.language.toLowerCase() === lang.code.toLowerCase() &&
              r.type === "holidays",
          );
          const dayInfoRecord = syncedLangPackVersions.find(
            (r) =>
              r.year === year.year &&
              r.language.toLowerCase() === lang.code.toLowerCase() &&
              r.type === "day-info",
          );
          if (holidaysRecord || dayInfoRecord) {
            langUpdateCount++;
          } else {
            langAvailableCount++;
          }
        }

        const unsyncedSelectedCount =
          selectedVersions.filter((v) => unsyncedVersionCodes.includes(v))
            .length +
          (hasUnsyncedLiturgical &&
          (selectedVersions.includes("__holidays__") ||
            selectedVersions.includes("__dayinfo__"))
            ? 1
            : 0);

        const totalUnsyncedCount =
          unsyncedVersionCodes.length + (hasUnsyncedLiturgical ? 1 : 0);
        const allUnsyncedSelected =
          !langAllSynced &&
          totalUnsyncedCount > 0 &&
          unsyncedSelectedCount === totalUnsyncedCount;
        const someUnsyncedSelected =
          unsyncedSelectedCount > 0 && !allUnsyncedSelected;

        const handleLanguageToggle = () => {
          if (langAllSynced) return;
          if (allUnsyncedSelected) {
            // Deselect unsynced items
            for (const vCode of unsyncedVersionCodes) {
              if (selectedVersions.includes(vCode)) {
                onToggleVersion(lang.code, vCode);
              }
            }
            if (
              hasUnsyncedLiturgical &&
              (selectedVersions.includes("__holidays__") ||
                selectedVersions.includes("__dayinfo__"))
            ) {
              onToggleLangPack(lang.code, "liturgical");
            }
          } else {
            // Select unsynced items
            for (const vCode of unsyncedVersionCodes) {
              if (!selectedVersions.includes(vCode)) {
                onToggleVersion(lang.code, vCode);
              }
            }
            if (
              hasUnsyncedLiturgical &&
              !selectedVersions.includes("__holidays__") &&
              !selectedVersions.includes("__dayinfo__")
            ) {
              onToggleLangPack(lang.code, "liturgical");
            }
          }
        };

        return (
          <View key={lang.code} className="mb-3">
            <View
              className={`bg-surface dark:bg-surface-dark flex-row items-center justify-between rounded-2xl px-5 py-4 border ${
                allUnsyncedSelected
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
                      allUnsyncedSelected
                        ? "text-primary"
                        : "text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                    style={{
                      fontFamily: "ReadingFont",
                      fontWeight: allUnsyncedSelected ? "600" : "500",
                    }}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      langAllSynced
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-muted dark:text-muted-dark"
                    }`}
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {langAllSynced
                      ? t("allContentSynced")
                      : langUpdateCount > 0 && langAvailableCount > 0
                      ? `${langUpdateCount} ${t("updateAvailable")}, ${langAvailableCount} ${t("available")}`
                      : langUpdateCount > 0
                      ? `${langUpdateCount} ${t("updateAvailable")}`
                      : `${langAvailableCount} ${t("available")}`}
                  </Text>
                </View>
              </TouchableOpacity>

              {langAllSynced ? (
                <View className="flex-row items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-xs text-green-600 dark:text-green-400 font-semibold"
                    style={{ fontFamily: "ReadingFont" }}
                  >
                    {t("synced")}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleLanguageToggle}
                  activeOpacity={0.7}
                  className="p-1"
                >
                  {allUnsyncedSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  ) : someUnsyncedSelected ? (
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
              )}
            </View>

            {isExpanded && (
              <View className="ml-3 mt-2 border-l-2 border-primary/20 pl-3">
                {/* Bible Versions Header */}
                <Text
                  className="mb-1 mt-2 text-[11px] font-semibold tracking-wider text-muted dark:text-muted-dark uppercase"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("bibleVersions")}
                </Text>

                {lang.versions.map((version) => {
                  const downloaded = langVersions.find(
                    (d) => d.version.toLowerCase() === version.code.toLowerCase(),
                  );
                  const isInstalled = !!downloaded;
                  const synced = isInstalled && downloaded.contentVersion >= version.contentVersion;
                  const isUpdate = isInstalled && downloaded.contentVersion < version.contentVersion;
                  const isSelected = selectedVersions.includes(version.code);

                  if (synced) {
                    return (
                      <View
                        key={version.code}
                        className="my-1 flex-row items-center gap-3 rounded-xl bg-surface/30 dark:bg-surface-dark/30 px-3.5 py-3 opacity-90"
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#16a34a"
                        />
                        <View className="flex-1">
                          <Text
                            className="text-sm text-[#2D2A24]/80 dark:text-[#E8E4DC]/80 font-normal"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {version.name} ({version.code.toUpperCase()})
                          </Text>
                          <Text
                            className="text-xs text-muted dark:text-muted-dark mt-0.5"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {version.contentVersion > 0
                              ? `v${version.contentVersion}`
                              : t("installed")}
                          </Text>
                        </View>
                        <View className="rounded-full bg-green-500/15 px-2 py-0.5">
                          <Text
                            className="text-[10px] text-green-600 dark:text-green-400 font-semibold"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {t("synced")}
                          </Text>
                        </View>
                      </View>
                    );
                  }

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
                        <Text
                          className="text-xs text-muted dark:text-muted-dark mt-0.5"
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {isUpdate
                            ? `v${downloaded.contentVersion} → v${version.contentVersion}`
                            : version.contentVersion > 0
                            ? `v${version.contentVersion}`
                            : t("available")}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2 py-0.5 ${
                          isUpdate ? "bg-amber-500/15" : "bg-primary/10"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-semibold ${
                            isUpdate
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-primary"
                          }`}
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          {isUpdate ? t("updateAvailable") : t("available")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {(() => {
                  const holidaysRecord = syncedLangPackVersions.find(
                    (r) =>
                      r.year === year.year &&
                      r.language.toLowerCase() === lang.code.toLowerCase() &&
                      r.type === "holidays",
                  );
                  const dayInfoRecord = syncedLangPackVersions.find(
                    (r) =>
                      r.year === year.year &&
                      r.language.toLowerCase() === lang.code.toLowerCase() &&
                      r.type === "day-info",
                  );
                  const isInstalled = !!holidaysRecord || !!dayInfoRecord;
                  const synced = liturgicalSynced;
                  const isUpdate = isInstalled && !synced;
                  const isSelected =
                    selectedVersions.includes("__holidays__") ||
                    selectedVersions.includes("__dayinfo__");

                  // Auto-downloaded behind the scenes when available/synced; only show row if there is a newer update
                  if (!isUpdate) return null;

                  return (
                    <>
                      {/* Liturgical Data Pack Header */}
                      <Text
                        className="mb-1 mt-3 text-[11px] font-semibold tracking-wider text-muted dark:text-muted-dark uppercase"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {t("liturgicalDataPack")}
                      </Text>

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
                            {t("liturgicalDataPack")}
                          </Text>
                          <Text
                            className="text-xs text-muted dark:text-muted-dark mt-0.5"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {t("holidaysFeastsDailyInfo")}
                          </Text>
                        </View>
                        <View className="rounded-full px-2 py-0.5 bg-amber-500/15">
                          <Text
                            className="text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                            style={{ fontFamily: "ReadingFont" }}
                          >
                            {t("updateAvailable")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
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
          {t("selectedPackages")}
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
            name={
              yearAllSynced
                ? "checkmark-circle-outline"
                : "download-outline"
            }
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
            ? t("preparingDownload")
            : canProceed
              ? `${t("startDownload")} (${totalSelectedItems})`
              : yearAllSynced
                ? t("allContentSynced")
                : t("selectContentPackages")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default LangSelectionStep;

