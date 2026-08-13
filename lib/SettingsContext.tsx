import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
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

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  appLanguage: "en",
  version: "niv",
  fontSizeSimple: 20,
  fontSizeExpanded: 18,
  alignSimple: "center",
  alignExpanded: "justify",
  readingFontFamily: "reading",
  theme: "light",
  calendarStyle: "ethiopian",
  reminderEnabled: false,
  reminderTime: "07:00",
  timeFormat: "12h",
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

      setSettings((prev) => {
        let { language, version } = prev;
        const langEntry = getLanguage(language, languages);

        if (!langEntry) {
          if (languages.length > 0) {
            language = languages[0].code;
            version = languages[0].versions[0]?.code ?? version;
          }
        } else {
          const versionExists = langEntry.versions.some((v) => v.code === version);
          if (!versionExists) {
            version = langEntry.versions[0]?.code ?? version;
          }
        }

        const normalized: AppSettings = {
          ...prev,
          language,
          version,
        };

        if (normalized.language !== prev.language || normalized.version !== prev.version) {
          saveSettings(normalized);
        }

        return normalized;
      });

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

      const languages = await refreshAvailableLanguages();
      if (cancelled) return;

      setLoaded(true);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [refreshAvailableLanguages]);

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
