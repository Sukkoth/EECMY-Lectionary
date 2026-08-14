import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, useColorScheme, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/lib/SettingsContext";
import { useOnboarding } from "@/lib/OnboardingContext";
import { useTranslation } from "@/lib/i18n";
import { scheduleDailyReminder } from "@/lib/NotificationService";
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
  isContentDownloaded,
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
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();
  const db = useSQLiteContext();

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingManifest(true);
    fetchManifest()
      .then((data) => {
        if (isMounted) setManifest(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingManifest(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownloadContent = async () => {
    if (!isOnboardingComplete) {
      await completeOnboarding();
    }
    onVersionSelect?.();
    router.push("/settings/check-updates/content");
  };

  const handleInlineDownload = async (
    langCode: string,
    versionCode: string,
    year: number,
  ) => {
    const key = `${langCode}-${versionCode}`;
    if (downloadingKey) return;

    if (!isOnboardingComplete) {
      await completeOnboarding();
    }

    setDownloadingKey(key);
    setDownloadProgress(15);

    try {
      if (!manifest) return;
      const yearOpt = manifest.years.find((y) => y.year === year);
      if (!yearOpt) return;
      const langOpt = yearOpt.languages.find((l) => l.code === langCode);
      if (!langOpt) return;
      const verOpt = langOpt.versions.find((v) => v.code === versionCode);
      if (!verOpt) return;

      setDownloadProgress(30);

      // Download readings
      const readingsPkg = await downloadReadings(verOpt.path);
      setDownloadProgress(55);

      const preparedReadings = prepareReadings(readingsPkg, langCode, versionCode);
      const syncRecordReading = prepareSyncRecord(
        year,
        langCode,
        langOpt.name,
        versionCode,
        verOpt.name,
        "readings",
        "",
        readingsPkg.version,
      );

      const allStatements = [...preparedReadings.statements, syncRecordReading];

      // Download liturgical packs if missing
      const hasHolidays = await isContentDownloaded(db, year, langCode, "holidays");
      if (!hasHolidays && langOpt.holidays) {
        const holidaysPkg = await downloadHolidays(langOpt.holidays.path);
        const prep = prepareHolidays(holidaysPkg, langCode);
        const syncRecord = prepareSyncRecord(
          year,
          langCode,
          langOpt.name,
          null,
          null,
          "holidays",
          "",
          holidaysPkg.version,
        );
        allStatements.push(...prep.statements, syncRecord);
      }

      const hasDayInfo = await isContentDownloaded(db, year, langCode, "day-info");
      if (!hasDayInfo && langOpt.dayInfo) {
        const dayInfoPkg = await downloadDayInfo(langOpt.dayInfo.path);
        const prep = prepareDayInfo(dayInfoPkg, langCode);
        const syncRecord = prepareSyncRecord(
          year,
          langCode,
          langOpt.name,
          null,
          null,
          "day-info",
          "",
          dayInfoPkg.version,
        );
        allStatements.push(...prep.statements, syncRecord);
      }

      setDownloadProgress(85);

      // Commit to SQLite
      await commitStatements(db, allStatements);
      setDownloadProgress(100);

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
      setDownloadingKey(null);
      setDownloadProgress(0);
    }
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

  // Installed versions from SQLite
  const installedVersions = availableLanguages.flatMap((lang) =>
    lang.versions.map((ver) => ({
      langCode: lang.code,
      langName: lang.language,
      versionCode: ver.code,
      versionLabel: ver.label,
    })),
  );

  const installedKeys = new Set(
    installedVersions.map((v) => `${v.langCode}-${v.versionCode}`),
  );

  // Compute available versions to download from manifest
  const currentYear = new Date().getFullYear();
  const downloadableVersions: DownloadableVersion[] = [];

  if (manifest) {
    // Look for current year or fallback to latest available year
    const yearOpt =
      manifest.years.find((y) => y.year === currentYear) ??
      manifest.years[0];

    if (yearOpt) {
      for (const lang of yearOpt.languages) {
        for (const ver of lang.versions) {
          const key = `${lang.code}-${ver.code}`;
          if (!installedKeys.has(key)) {
            downloadableVersions.push({
              langCode: lang.code,
              langName: lang.name,
              versionCode: ver.code,
              versionLabel: ver.name,
              year: yearOpt.year,
            });
          }
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
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                  )}
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
            Available to Download ({currentYear})
          </Text>
          {downloadableVersions.map((item) => {
            const key = `${item.langCode}-${item.versionCode}`;
            const isDownloading = downloadingKey === key;

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
                disabled={Boolean(downloadingKey)}
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
                        ? `Downloading... ${downloadProgress}%`
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
                        {downloadProgress}%
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

      {isLoadingManifest && downloadableVersions.length === 0 && (
        <View className="py-4 items-center justify-center flex-row gap-2">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text
            className="text-xs text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            Checking available translations...
          </Text>
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
