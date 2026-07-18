import { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
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

  const [step, setStep] = useState<WizardStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  const [selectedLangs, setSelectedLangs] = useState<Record<string, string[]>>({});
  const [expandedLangs, setExpandedLangs] = useState<Record<string, boolean>>({});

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

  const totalDownloadTasks = Object.entries(selectedLangs).reduce(
    (sum, [_, versions]) => sum + 2 + versions.length,
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
          selectedLangs[l.code].map((vCode) => {
            const v = l.versions.find((ver) => ver.code === vCode);
            return `${l.name} — ${v?.name ?? vCode.toUpperCase()}`;
          }),
        )
    : [];

  const goBack = () => {
    setError(null);
    if (step === "selectYear") {
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
      setStep("selectYear");
    } catch (err) {
      if (abortRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Failed to check for updates.";
      setError(msg);
      setStep("idle");
    }
  }, []);

  const handleYearSelect = useCallback((year: YearOption) => {
    setSelectedYear(year);
    setSelectedLangs({});
    setExpandedLangs({});
    setStep("selectLang");
  }, []);

  const toggleLanguageVersions = useCallback(
    (langCode: string, allVersionCodes: string[]) => {
      setSelectedLangs((prev) => {
        const current = prev[langCode] ?? [];
        const allSelected = current.length === allVersionCodes.length;
        if (allSelected) {
          const next = { ...prev };
          delete next[langCode];
          return next;
        }
        return { ...prev, [langCode]: [...allVersionCodes] };
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
        const versions = selectedLangs[lang.code];
        if (!versions?.length) continue;

        if (abortRef.current) return;

        const dayInfoPkg = await downloadDayInfo(lang.dayInfo.path);
        const dayInfoPrepared = prepareDayInfo(dayInfoPkg, lang.code);
        const dayInfoSync = prepareSyncRecord(
          year,
          lang.code,
          lang.name,
          null,
          null,
          "day-info",
          "",
        );
        await commitStatements(db, [...dayInfoPrepared.statements, dayInfoSync]);
        updateProgress();

        if (abortRef.current) return;

        const holidaysPkg = await downloadHolidays(lang.holidays.path);
        const holidaysPrepared = prepareHolidays(holidaysPkg, lang.code);
        const holidaysSync = prepareSyncRecord(
          year,
          lang.code,
          lang.name,
          null,
          null,
          "holidays",
          "",
        );
        await commitStatements(db, [...holidaysPrepared.statements, holidaysSync]);
        updateProgress();

        for (const versionCode of versions) {
          if (abortRef.current) return;

          const versionMeta = lang.versions.find((v) => v.code === versionCode);
          const readingsPkg = await downloadReadings(versionMeta!.path);
          const readingsPrepared = prepareReadings(
            readingsPkg,
            lang.code,
            versionCode,
          );
          const readingsSync = prepareSyncRecord(
            year,
            lang.code,
            lang.name,
            versionCode,
            versionMeta!.name,
            "readings",
            "",
          );
          await commitStatements(db, [...readingsPrepared.statements, readingsSync]);
          updateProgress();
        }
      }

      if (abortRef.current) return;
      setStep("success");
    } catch (err) {
      if (abortRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Download failed. Please try again.";
      setError(msg);
      setStep("selectLang");
    }
  }, [selectedYear, selectedLangs, totalDownloadTasks, db]);

  const handleDone = useCallback(() => {
    abortRef.current = true;
    setStep("idle");
    setManifest(null);
    setSelectedYear(null);
    setSelectedLangs({});
    setExpandedLangs({});
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
              onToggleExpand={toggleExpand}
              onDownload={handleDownload}
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
