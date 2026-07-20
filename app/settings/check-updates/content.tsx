import { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Manifest, YearOption, WizardStep } from "../../../types/check-update";
import {
  fetchManifest,
  downloadDayInfo,
  downloadHolidays,
  downloadReadings,
  prepareDayInfo,
  prepareHolidays,
  prepareReadings,
  prepareSyncRecord,
  commitStatements,
  getSyncedYears,
  getSyncedReadingCounts,
  getSyncedReadingVersions,
  getSyncedLangPackVersions,
  getDownloadedVersionsForYearLang,
  isContentDownloaded,
} from "../../../lib/content";
import {
  IdleStep,
  CheckingStep,
  YearSelectionStep,
  LangSelectionStep,
  DownloadProgressStep,
  SuccessStep,
  StepIndicator,
} from "../../../components/check-updates";

export default function ContentUpdateScreen() {
  const isDark = useColorScheme() === "dark";
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  const [selectedLangs, setSelectedLangs] = useState<Record<string, string[]>>({});
  const [expandedLangs, setExpandedLangs] = useState<Record<string, boolean>>({});

  const [downloadedYears, setDownloadedYears] = useState<number[]>([]);
  const [downloadedVersions, setDownloadedVersions] = useState<Record<string, { version: string; pulledAt: string; contentVersion: number }[]>>({});
  const [downloadedLangPacks, setDownloadedLangPacks] = useState<Record<string, { holidays: boolean; dayInfo: boolean }>>({});
  const [syncedReadingCounts, setSyncedReadingCounts] = useState<Record<number, number>>({});
  const [syncedLangPackVersions, setSyncedLangPackVersions] = useState<{ year: number; language: string; type: string; contentVersion: number }[]>([]);
  const [syncedReadingVersions, setSyncedReadingVersions] = useState<{ year: number; language: string; version: string; contentVersion: number }[]>([]);
  const [isYearLoading, setIsYearLoading] = useState(false);

  const loadSyncedData = useCallback(async () => {
    const [years, readingCounts, langPackVersions, readingVersions] = await Promise.all([
      getSyncedYears(db),
      getSyncedReadingCounts(db),
      getSyncedLangPackVersions(db),
      getSyncedReadingVersions(db),
    ]);
    setDownloadedYears(years);
    const readingMap: Record<number, number> = {};
    for (const c of readingCounts) {
      readingMap[c.year] = c.syncedCount;
    }
    setSyncedReadingCounts(readingMap);
    setSyncedLangPackVersions(langPackVersions);
    setSyncedReadingVersions(readingVersions);
  }, [db]);

  const loadDownloadedVersions = useCallback(async (year: number, languages: { code: string }[]) => {
    const result: Record<string, { version: string; pulledAt: string; contentVersion: number }[]> = {};
    for (const lang of languages) {
      const versions = await getDownloadedVersionsForYearLang(db, year, lang.code);
      if (versions.length > 0) {
        result[lang.code] = versions;
      }
    }
    setDownloadedVersions(result);
  }, [db]);

  const loadLangPackStatus = useCallback(async (year: number, languages: { code: string }[]) => {
    const result: Record<string, { holidays: boolean; dayInfo: boolean }> = {};
    for (const lang of languages) {
      const [hasHolidays, hasDayInfo] = await Promise.all([
        isContentDownloaded(db, year, lang.code, "holidays"),
        isContentDownloaded(db, year, lang.code, "day-info"),
      ]);
      result[lang.code] = { holidays: hasHolidays, dayInfo: hasDayInfo };
    }
    setDownloadedLangPacks(result);
  }, [db]);

  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const totalSelectedItems = Object.values(selectedLangs).reduce(
    (sum, versions) => sum + versions.length,
    0,
  );

  const totalDownloadTasks = Object.values(selectedLangs).reduce(
    (sum, items) => sum + items.length,
    0,
  );

  const selectedLanguageNames = selectedYear
    ? selectedYear.languages
        .filter((l) => selectedLangs[l.code]?.length)
        .map((l) => l.name)
    : [];

  const selectedVersionLabels = selectedYear
    ? selectedYear.languages
        .filter((l) => selectedLangs[l.code]?.length)
        .flatMap((l) =>
          selectedLangs[l.code]
            .filter((vCode) => !vCode.startsWith("__"))
            .map((vCode) => {
              const v = l.versions.find((ver) => ver.code === vCode);
              return `${l.name} — ${v?.name ?? vCode.toUpperCase()}`;
            })
            .concat(
              selectedLangs[l.code]
                .filter((vCode) => vCode.startsWith("__"))
                .map((vCode) => {
                  const label = vCode === "__holidays__" ? "Holidays" : "Day Info";
                  return `${l.name} — ${label}`;
                }),
            ),
        )
    : [];

  const goBack = () => {
    setError(null);
    if (step === "checking" || step === "downloading") {
      abortRef.current = true;
      setStep("idle");
      setManifest(null);
      setSelectedYear(null);
      setSelectedLangs({});
      setExpandedLangs({});
      setProgress(0);
    } else if (step === "selectYear") {
      setManifest(null);
      setStep("idle");
    } else if (step === "selectLang") {
      setSelectedYear(null);
      setSelectedLangs({});
      setExpandedLangs({});
      setStep("selectYear");
    }
  };

  const handleCheck = useCallback(async () => {
    setStep("checking");
    setError(null);
    abortRef.current = false;

    try {
      const data = await fetchManifest();
      if (abortRef.current) return;
      setManifest(data);
      await loadSyncedData();
      setStep("selectYear");
    } catch (err) {
      if (abortRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Failed to check for updates.";
      setError(msg);
      setStep("idle");
    }
  }, [loadSyncedData]);

  const handleYearSelect = useCallback(async (year: YearOption) => {
    if (isYearLoading) return;
    setIsYearLoading(true);
    setSelectedYear(year);
    setSelectedLangs({});
    setExpandedLangs({});
    try {
      await Promise.all([
        loadDownloadedVersions(year.year, year.languages),
        loadLangPackStatus(year.year, year.languages),
      ]);
      setStep("selectLang");
    } finally {
      setIsYearLoading(false);
    }
  }, [isYearLoading, loadDownloadedVersions, loadLangPackStatus]);

  const isSentinel = (v: string) => v.startsWith("__");

  const toggleLanguageVersions = useCallback(
    (langCode: string, allVersionCodes: string[]) => {
      setSelectedLangs((prev) => {
        const current = prev[langCode] ?? [];
        const readingSelections = current.filter((v) => !isSentinel(v));
        const allReadingSelected = readingSelections.length === allVersionCodes.length;
        const sentinels = current.filter(isSentinel);
        if (allReadingSelected) {
          if (sentinels.length === 0) {
            const next = { ...prev };
            delete next[langCode];
            return next;
          }
          return { ...prev, [langCode]: [...sentinels] };
        }
        return { ...prev, [langCode]: [...allVersionCodes, ...sentinels] };
      });
    },
    [],
  );

  const toggleVersion = useCallback((langCode: string, version: string) => {
    setSelectedLangs((prev) => {
      const current = prev[langCode] ?? [];
      const isSelected = current.includes(version);
      const nextVersions = isSelected
        ? current.filter((v) => v !== version)
        : [...current, version];
      if (nextVersions.length === 0) {
        const next = { ...prev };
        delete next[langCode];
        return next;
      }
      return { ...prev, [langCode]: nextVersions };
    });
  }, []);

  const toggleExpand = useCallback((langCode: string) => {
    setExpandedLangs((prev) => ({ ...prev, [langCode]: !prev[langCode] }));
  }, []);

  const handleToggleLangPack = useCallback((langCode: string, type: "holidays" | "dayInfo") => {
    const key = type === "holidays" ? "__holidays__" : "__dayinfo__";
    setSelectedLangs((prev) => {
      const current = prev[langCode] ?? [];
      const isSelected = current.includes(key);
      const next = isSelected
        ? current.filter((v) => v !== key)
        : [...current, key];
      if (next.length === 0) {
        const updated = { ...prev };
        delete updated[langCode];
        return updated;
      }
      return { ...prev, [langCode]: next };
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedYear) return;

    setStep("downloading");
    setProgress(0);
    setError(null);
    abortRef.current = false;

    const year = selectedYear.year;
    let completed = 0;

    const updateProgress = () => {
      completed++;
      setProgress(Math.round((completed / totalDownloadTasks) * 100));
    };

    try {
      for (const lang of selectedYear.languages) {
        const items = selectedLangs[lang.code];
        if (!items?.length) continue;

        if (items.includes("__holidays__")) {
          if (abortRef.current) return;
          const pkg = await downloadHolidays(lang.holidays.path);
          const prepared = prepareHolidays(pkg, lang.code);
          const sync = prepareSyncRecord(year, lang.code, lang.name, null, null, "holidays", "", lang.holidays.version);
          await commitStatements(db, [...prepared.statements, sync]);
          updateProgress();
        }

        if (items.includes("__dayinfo__")) {
          if (abortRef.current) return;
          const pkg = await downloadDayInfo(lang.dayInfo.path);
          const prepared = prepareDayInfo(pkg, lang.code);
          const sync = prepareSyncRecord(year, lang.code, lang.name, null, null, "day-info", "", lang.dayInfo.version);
          await commitStatements(db, [...prepared.statements, sync]);
          updateProgress();
        }

        const readingVersions = items.filter((v) => v !== "__holidays__" && v !== "__dayinfo__");
        for (const versionCode of readingVersions) {
          if (abortRef.current) return;

          const versionMeta = lang.versions.find((v) => v.code === versionCode);
          const readingsPkg = await downloadReadings(versionMeta!.path);
          const readingsPrepared = prepareReadings(readingsPkg, lang.code, versionCode);
          const readingsSync = prepareSyncRecord(
            year,
            lang.code,
            lang.name,
            versionCode,
            versionMeta!.name,
            "readings",
            "",
            versionMeta!.contentVersion,
          );
          await commitStatements(db, [...readingsPrepared.statements, readingsSync]);
          updateProgress();
        }
      }

      if (abortRef.current) return;
      await loadSyncedData();
      if (selectedYear) {
        await Promise.all([
          loadDownloadedVersions(selectedYear.year, selectedYear.languages),
          loadLangPackStatus(selectedYear.year, selectedYear.languages),
        ]);
      }
      if (selectedYear) {
        for (const lang of selectedYear.languages) {
          const items = selectedLangs[lang.code];
          if (items?.includes("__holidays__")) {
            queryClient.refetchQueries({ queryKey: ["holidays", lang.code], type: "all" });
          }
        }
      }
      setStep("success");
    } catch (err) {
      if (abortRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Download failed. Please try again.";
      setError(msg);
      await loadSyncedData();
      if (selectedYear) {
        await Promise.all([
          loadDownloadedVersions(selectedYear.year, selectedYear.languages),
          loadLangPackStatus(selectedYear.year, selectedYear.languages),
        ]);
      }
      setStep("selectLang");
    }
  }, [selectedYear, selectedLangs, totalDownloadTasks, db, loadSyncedData, loadDownloadedVersions, loadLangPackStatus, queryClient]);

  const handleDone = useCallback(() => {
    abortRef.current = true;
    setStep("idle");
    setManifest(null);
    setSelectedYear(null);
    setSelectedLangs({});
    setExpandedLangs({});
    setDownloadedLangPacks({});
    setProgress(0);
    setError(null);
  }, []);

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6">
        <View className="mb-6 mt-8 flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => (step === "idle" ? router.back() : goBack())}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Content Update
          </Text>
        </View>

        {step !== "idle" && (
          <StepIndicator currentStep={step} isDark={isDark} />
        )}

        {error && (
          <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-red-500/10 px-5 py-4">
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text
              className="flex-1 text-base text-red-600 dark:text-red-400"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              {error}
            </Text>
            {step === "idle" && (
              <TouchableOpacity
                onPress={handleCheck}
                activeOpacity={0.7}
                className="rounded-lg bg-red-500/20 px-3 py-1.5"
              >
                <Text
                  className="text-sm text-red-600 dark:text-red-400"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="flex-1">
          {step === "idle" && <IdleStep onCheck={handleCheck} />}

          {step === "checking" && <CheckingStep isDark={isDark} />}

          {step === "selectYear" && manifest && (
            <YearSelectionStep
              manifest={manifest}
              onSelectYear={handleYearSelect}
              downloadedYears={downloadedYears}
              syncedReadingCounts={syncedReadingCounts}
              syncedLangPackVersions={syncedLangPackVersions}
              syncedReadingVersions={syncedReadingVersions}
              isDark={isDark}
            />
          )}

          {step === "selectLang" && selectedYear && (
            <LangSelectionStep
              year={selectedYear}
              selectedLangs={selectedLangs}
              expandedLangs={expandedLangs}
              totalSelectedItems={totalSelectedItems}
              onToggleLanguage={toggleLanguageVersions}
              onToggleVersion={toggleVersion}
              onToggleLangPack={handleToggleLangPack}
              onToggleExpand={toggleExpand}
              onDownload={handleDownload}
              downloadedVersions={downloadedVersions}
              downloadedLangPacks={downloadedLangPacks}
              syncedLangPackVersions={syncedLangPackVersions}
              isDark={isDark}
            />
          )}

          {step === "downloading" && selectedYear && (
            <DownloadProgressStep
              progress={progress}
              year={selectedYear}
              selectedVersionLabels={selectedVersionLabels}
              isDark={isDark}
            />
          )}

          {step === "success" && selectedYear && (
            <SuccessStep
              year={selectedYear}
              selectedLanguageNames={selectedLanguageNames}
              selectedVersionLabels={selectedVersionLabels}
              totalSelectedItems={totalSelectedItems}
              onDone={handleDone}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
