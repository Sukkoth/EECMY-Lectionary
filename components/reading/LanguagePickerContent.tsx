import { useState, useMemo } from "react";
import { Text, TouchableOpacity, View, useColorScheme, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { scheduleDailyReminder } from "@/lib/NotificationService";
import { gregorianToEthiopian } from "@/lib/ethiopianCalendar";
import {
  fetchManifest,
  downloadReadings,
  downloadDayInfo,
  downloadHolidays,
  prepareReadings,
  prepareDayInfo,
  prepareHolidays,
  prepareSyncRecord,
  commitStatements,
  getInstalledVersionsWithContentVersion,
  getSyncedLangPackVersions,
  type Manifest,
} from "@/lib/content";

type LanguagePickerContentProps = {
  onVersionSelect?: () => void;
  hideHeader?: boolean;
};

type DownloadableVersion = {
  langCode: string;
  langName: string;
  versionCode: string;
  versionLabel: string;
  year: number;
};

export default function LanguagePickerContent({
  onVersionSelect,
  hideHeader,
}: LanguagePickerContentProps) {
  const isDark = useColorScheme() === "dark";
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { settings, setAllSettings, availableLanguages, languagesError, refreshAvailableLanguages } =
    useSettings();
  const db = useSQLiteContext();

  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, number>>({});
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

  const { data: manifest = null } = useQuery<Manifest>({
    queryKey: ["remoteManifest"],
    queryFn: fetchManifest,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });

  const { data: installedVersionsWithMeta = [] } = useQuery({
    queryKey: ["installedVersionsWithMeta"],
    queryFn: () => getInstalledVersionsWithContentVersion(db),
  });

  // Map of installed version keys ("en-niv") that have a newer contentVersion in remote manifest
  const updatesMap = useMemo(() => {
    const map = new Map<string, { year: number; contentVersion: number }>();
    if (!manifest) return map;

    const ethYear = gregorianToEthiopian(new Date()).year;
    const yearOpt = manifest.years.find((y) => y.year === ethYear);

    if (!yearOpt) return map;

    for (const lang of yearOpt.languages) {
      for (const ver of lang.versions) {
        const key = `${lang.code.toLowerCase()}-${ver.code.toLowerCase()}`;
        const installed = installedVersionsWithMeta.find(
          (i) =>
            i.language.toLowerCase() === lang.code.toLowerCase() &&
            i.version.toLowerCase() === ver.code.toLowerCase()
        );
        if (installed && ver.contentVersion > installed.contentVersion) {
          map.set(key, { year: yearOpt.year, contentVersion: ver.contentVersion });
        }
      }
    }
    return map;
  }, [manifest, installedVersionsWithMeta]);

  const handleInlineDownload = async (
    langCode: string,
    versionCode: string,
    year: number,
  ) => {
    const lCode = langCode.toLowerCase();
    const vCode = versionCode.toLowerCase();
    const key = `${lCode}-${vCode}`;
    if (downloadProgressMap[key] != null) return;

    const updateProgress = (pct: number) => {
      setDownloadProgressMap((prev) => ({ ...prev, [key]: pct }));
    };

    updateProgress(15);

    try {
      if (!manifest) return;
      const yearOpt = manifest.years.find((y) => y.year === year);
      if (!yearOpt) return;
      const langOpt = yearOpt.languages.find((l) => l.code.toLowerCase() === lCode);
      if (!langOpt) return;
      const verOpt = langOpt.versions.find((v) => v.code.toLowerCase() === vCode);
      if (!verOpt) return;

      updateProgress(30);

      // Download readings
      const readingsPkg = await downloadReadings(verOpt.path);
      updateProgress(55);

      const preparedReadings = prepareReadings(
        readingsPkg,
        lCode,
        vCode,
        verOpt.contentVersion,
      );
      const syncRecordReading = prepareSyncRecord(
        year,
        lCode,
        langOpt.name,
        vCode,
        verOpt.name,
        "readings",
        "",
        verOpt.contentVersion,
      );

      const allStatements = [...preparedReadings.statements, syncRecordReading];

      // Check holidays: download if missing or if newer version available
      const syncedLangPacks = await getSyncedLangPackVersions(db);
      const holidayRecord = syncedLangPacks.find(
        (r) => r.year === year && r.language.toLowerCase() === lCode && r.type === "holidays",
      );
      const holidayNeedsDownload =
        langOpt.holidays &&
        langOpt.holidays.version > 0 &&
        (!holidayRecord || holidayRecord.contentVersion < langOpt.holidays.version);

      if (holidayNeedsDownload && langOpt.holidays?.path) {
        const holidaysPkg = await downloadHolidays(langOpt.holidays.path);
        const prep = prepareHolidays(holidaysPkg, lCode, langOpt.holidays.version);
        const syncRecord = prepareSyncRecord(
          year,
          lCode,
          langOpt.name,
          null,
          null,
          "holidays",
          "",
          langOpt.holidays.version,
        );
        allStatements.push(...prep.statements, syncRecord);
      }

      // Check dayInfo: download if missing or if newer version available
      const dayInfoRecord = syncedLangPacks.find(
        (r) => r.year === year && r.language.toLowerCase() === lCode && r.type === "day-info",
      );
      const dayInfoNeedsDownload =
        langOpt.dayInfo &&
        langOpt.dayInfo.version > 0 &&
        (!dayInfoRecord || dayInfoRecord.contentVersion < langOpt.dayInfo.version);

      if (dayInfoNeedsDownload && langOpt.dayInfo?.path) {
        const dayInfoPkg = await downloadDayInfo(langOpt.dayInfo.path);
        const prep = prepareDayInfo(dayInfoPkg, lCode, langOpt.dayInfo.version);
        const syncRecord = prepareSyncRecord(
          year,
          lCode,
          langOpt.name,
          null,
          null,
          "day-info",
          "",
          langOpt.dayInfo.version,
        );
        allStatements.push(...prep.statements, syncRecord);
      }

      updateProgress(85);

      // Commit to SQLite
      await commitStatements(db, allStatements);
      updateProgress(100);

      // Invalidate query cache & refresh context
      await refreshAvailableLanguages();
      queryClient.invalidateQueries();
    } catch (err) {
      console.warn("Inline download validation caught:", err);
      const detail =
        err instanceof Error ? err.message : "Downloaded data package is invalid.";
      const displayMessage = __DEV__
        ? `Could not download translation "${versionCode.toUpperCase()}": ${detail}`
        : `Could not download translation "${versionCode.toUpperCase()}". The content package is invalid or corrupted. Please try again later.`;

      setErrorMessageModal(displayMessage);
    } finally {
      setDownloadProgressMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleVersionSelect = async (
    langCode: string,
    versionCode: string,
  ) => {
    // If the user taps the version that is ALREADY active, just close without incrementing count!
    if (settings.language === langCode && settings.version === versionCode) {
      onVersionSelect?.();
      return;
    }

    const currentUsage = settings.versionUsageCount ?? {};
    const updatedUsage = {
      ...currentUsage,
      [versionCode]: (currentUsage[versionCode] ?? 0) + 1,
    };

    await setAllSettings({
      ...settings,
      language: langCode,
      version: versionCode,
      versionUsageCount: updatedUsage,
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

  const usageCount = settings.versionUsageCount ?? {};

  // Installed versions from SQLite sorted with currently active version pinned to top, then by usage frequency
  const installedVersions = availableLanguages
    .flatMap((lang) =>
      lang.versions.map((ver) => ({
        langCode: lang.code,
        langName: lang.language,
        versionCode: ver.code,
        versionLabel: ver.label,
        count: usageCount[ver.code] ?? 0,
      })),
    )
    .sort((a, b) => {
      const isActiveA =
        a.langCode === settings.language && a.versionCode === settings.version;
      const isActiveB =
        b.langCode === settings.language && b.versionCode === settings.version;

      if (isActiveA) return -1;
      if (isActiveB) return 1;
      return b.count - a.count;
    });

  const installedKeys = new Set(
    installedVersions.map((v) => `${v.langCode.toLowerCase()}-${v.versionCode.toLowerCase()}`),
  );

  // Compute available versions to download from manifest strictly for the CURRENT liturgical year
  const ethYear = gregorianToEthiopian(new Date()).year;
  const currentYearOpt = manifest?.years.find((y) => y.year === ethYear);
  const downloadableVersions: DownloadableVersion[] = [];

  if (currentYearOpt) {
    for (const lang of currentYearOpt.languages) {
      for (const ver of lang.versions) {
        const key = `${lang.code.toLowerCase()}-${ver.code.toLowerCase()}`;
        if (!installedKeys.has(key)) {
          downloadableVersions.push({
            langCode: lang.code,
            langName: lang.name,
            versionCode: ver.code,
            versionLabel: ver.name,
            year: currentYearOpt.year,
          });
        }
      }
    }
  }

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



      {/* Upcoming Year Lectionary Transition Banner (Month 12 & 13) */}
      {(() => {
        const ethDate = gregorianToEthiopian(new Date());
        const isYearEndTransition = ethDate.month >= 11; // 0-indexed: 11 is Nehase (Month 12), 12 is Pagume (Month 13)
        const nextEthYear = ethDate.year + 1;
        const nextYearManifest = isYearEndTransition
          ? manifest?.years.find((y) => y.year === nextEthYear)
          : null;

        if (!nextYearManifest) return null;

        return (
          <TouchableOpacity
            onPress={() => {
              onVersionSelect?.();
              router.push({
                pathname: "/settings/check-updates/content",
                params: {
                  preselectYear: String(nextEthYear),
                  autoCheck: "true",
                },
              });
            }}
            activeOpacity={0.8}
            className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-1 flex-row items-center gap-3 pr-2">
              <View className="h-9 w-9 rounded-full items-center justify-center bg-amber-500/20">
                <Ionicons name="calendar" size={18} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-amber-900 dark:text-amber-200 text-sm font-semibold"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("upcomingYearLectionaryReady").replace(
                    "{year}",
                    String(nextEthYear),
                  )}
                </Text>
                <Text
                  className="text-amber-700/80 dark:text-amber-400/80 text-xs mt-0.5"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("downloadNewYearReadings")}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={22} color="#d97706" />
          </TouchableOpacity>
        );
      })()}

      {/* Installed Translations */}
      {installedVersions.length > 0 && (
        <View className="space-y-2 mb-4">
          <Text
            className="text-muted dark:text-muted-dark mb-1 text-xs font-semibold uppercase tracking-wider px-1"
            style={{ fontFamily: "ReadingFont" }}
          >
            Installed Translations
          </Text>
          {installedVersions.map((item) => {
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

                {/* Right side: Version Code Badge + Native Checkmark Icon / Update Button */}
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

                  {/* If CDN has a newer contentVersion for this installed translation, show Update button */}
                  {(() => {
                    const updateMeta = updatesMap.get(`${item.langCode.toLowerCase()}-${item.versionCode.toLowerCase()}`);
                    const downloadKey = `${item.langCode}-${item.versionCode}`;
                    const isDownloadingThis = downloadProgressMap[downloadKey] !== undefined;

                    if (updateMeta) {
                      return (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleInlineDownload(item.langCode, item.versionCode, updateMeta.year);
                          }}
                          disabled={isDownloadingThis}
                          activeOpacity={0.8}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 flex-row items-center gap-1.5 border border-amber-500/30"
                        >
                          {isDownloadingThis ? (
                            <ActivityIndicator size="small" color="#f59e0b" />
                          ) : (
                            <>
                              <Ionicons name="refresh-outline" size={14} color="#f59e0b" />
                              <Text
                                className="text-amber-600 dark:text-amber-400 text-xs font-semibold"
                                style={{ fontFamily: "ReadingFont" }}
                              >
                                Update
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    }

                    if (isActive) {
                      return <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />;
                    }

                    return null;
                  })()}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}



      {/* Available to Download Section */}
      {downloadableVersions.length > 0 && (
        <View className="space-y-2 mt-2">
          <Text
            className="text-muted dark:text-muted-dark mb-1 text-xs font-semibold uppercase tracking-wider px-1"
            style={{ fontFamily: "ReadingFont" }}
          >
            Available to Download ({ethYear})
          </Text>
          {downloadableVersions.map((item) => {
            const key = `${item.langCode}-${item.versionCode}`;
            const isDownloading = downloadProgressMap[key] != null;
            const progress = downloadProgressMap[key] ?? 0;

            return (
              <TouchableOpacity
                key={`download-${key}`}
                onPress={() =>
                  handleInlineDownload(
                    item.langCode,
                    item.versionCode,
                    item.year,
                  )
                }
                disabled={isDownloading}
                activeOpacity={0.75}
                className="flex-row items-center justify-between rounded-2xl p-4 my-1 border bg-surface/60 dark:bg-surface-dark/60 border-dashed border-stone-300/80 dark:border-stone-700/80"
              >
                <View className="flex-1 flex-row items-center gap-3.5 pr-2">
                  <View className="h-9 w-9 rounded-full items-center justify-center bg-primary/10">
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                      <Ionicons
                        name="cloud-download-outline"
                        size={18}
                        color="#3b82f6"
                      />
                    )}
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
                      {isDownloading
                        ? `Downloading... ${progress}%`
                        : `${item.langName} • ${item.year}`}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2.5">
                  {/* Version Abbreviation Badge */}
                  <View className="px-2.5 py-1 rounded-lg border bg-bg-warm/80 dark:bg-bg-warm-dark/80 border-stone-200/50 dark:border-stone-800/50">
                    <Text
                      className="text-[11px] uppercase font-semibold text-muted dark:text-muted-dark opacity-80"
                      style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                    >
                      {item.versionCode}
                    </Text>
                  </View>

                  {/* Get / Download Button */}
                  <View className="px-3 py-1.5 rounded-xl bg-primary/15 flex-row items-center gap-1">
                    {isDownloading ? (
                      <Text
                        className="text-primary text-xs font-semibold"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {progress}%
                      </Text>
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={14} color="#3b82f6" />
                        <Text
                          className="text-primary text-xs font-semibold"
                          style={{ fontFamily: "ReadingFont" }}
                        >
                          Get
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Custom In-App Error Overlay (Works inside Bottom Sheet Modal and full screen) */}
      {Boolean(errorMessageModal) && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/60 px-6 py-8">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#1C1C1C] border border-stone-200/60 dark:border-stone-800/60 shadow-xl">
            <View className="flex-row items-center gap-2.5 mb-3">
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
              <Text
                className="text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Download Error
              </Text>
            </View>

            <Text
              className="mb-6 text-sm text-muted dark:text-muted-dark leading-relaxed"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {errorMessageModal}
            </Text>

            <View className="flex-row justify-end">
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl bg-primary px-6 py-2.5"
                onPress={() => setErrorMessageModal(null)}
              >
                <Text
                  className="text-center text-sm font-semibold text-white"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
