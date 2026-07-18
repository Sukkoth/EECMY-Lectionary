import { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CHECK_DELAY_MS, DOWNLOAD_TICK_MS, DOWNLOAD_TOTAL_MS, MOCK_MANIFEST } from "./types";
import type { Manifest, YearOption, WizardStep } from "./types";
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

  const [step, setStep] = useState<WizardStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  const [selectedLangs, setSelectedLangs] = useState<Record<string, string[]>>({});
  const [expandedLangs, setExpandedLangs] = useState<Record<string, boolean>>({});

  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  const totalSelectedItems = Object.values(selectedLangs).reduce(
    (sum, versions) => sum + versions.length,
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
            return `${l.name} — ${v?.label ?? vCode.toUpperCase()}`;
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

  const handleCheck = useCallback(() => {
    setStep("checking");
    setError(null);

    setTimeout(() => {
      if (Math.random() < 0.1) {
        setError("Network error. Please check your connection and try again.");
        setStep("idle");
        return;
      }
      setManifest(MOCK_MANIFEST);
      setStep("selectYear");
    }, CHECK_DELAY_MS);
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

  const handleDownload = useCallback(() => {
    setStep("downloading");
    setProgress(0);

    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / DOWNLOAD_TOTAL_MS) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (progressTimer.current) clearInterval(progressTimer.current);
        progressTimer.current = null;

        if (Math.random() < 0.1) {
          setError("Download failed. Please try again.");
          setStep("selectLang");
          return;
        }

        setStep("success");
      }
    }, DOWNLOAD_TICK_MS);
  }, []);

  const handleDone = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
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
