import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Appearance } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { loadSettings, saveSettings, type AppSettings } from "./settings";
import { getAvailableLanguages, getLanguage, type LanguageEntry } from "./languages";

type SettingsContextValue = {
  settings: AppSettings;
  availableLanguages: LanguageEntry[];
  languagesError: string | null;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  setAllSettings: (next: AppSettings) => Promise<void>;
  refreshAvailableLanguages: () => Promise<LanguageEntry[]>;
};

const getInitialTheme = (): "light" | "dark" =>
  Appearance.getColorScheme() === "dark" ? "dark" : "light";

const DEFAULT_SETTINGS: AppSettings = {
  language: "am",
  appLanguage: "en",
  version: "am54",
  showVersionFullName: false,
  fontSizeSimple: 20,
  fontSizeExpanded: 18,
  alignSimple: "center",
  alignExpanded: "justify",
  readingFontFamily: "reading",
  theme: getInitialTheme(),
  calendarStyle: "ethiopian",
  showSeasonColors: true,
  reminderEnabled: false,
  reminderTime: "07:00",
  timeFormat: "12h",
  versionUsageCount: {},
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageEntry[]>([]);
  const [languagesError, setLanguagesError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refreshAvailableLanguages = useCallback(async (): Promise<LanguageEntry[]> => {
    try {
      const languages = await getAvailableLanguages(db);
      setAvailableLanguages(languages);
      setLanguagesError(null);
      return languages;
    } catch (err: any) {
      const msg = err?.message ?? "Failed to load languages.";
      setLanguagesError(msg);
      return [];
    }
  }, [db]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = await loadSettings().catch(() => DEFAULT_SETTINGS);
      if (cancelled) return;

      setSettings(saved);
      const languages = await getAvailableLanguages(db).catch(() => []);
      if (cancelled) return;

      setAvailableLanguages(languages);
      setLoaded(true);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);
  };

  const setAllSettings = async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  if (!loaded) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        availableLanguages,
        languagesError,
        updateSetting,
        setAllSettings,
        refreshAvailableLanguages,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
