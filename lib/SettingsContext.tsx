import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
};

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  version: "niv",
  fontSizeSimple: 20,
  fontSizeExpanded: 18,
  alignSimple: "center",
  alignExpanded: "justify",
  theme: "light",
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageEntry[]>([]);
  const [languagesError, setLanguagesError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Independent fetches — one failure doesn't lose the other's result
      const [saved, languages] = await Promise.all([
        loadSettings().catch(() => DEFAULT_SETTINGS),
        getAvailableLanguages(db).catch((err: Error) => {
          setLanguagesError(err?.message ?? "Failed to load languages.");
          return [] as LanguageEntry[];
        }),
      ]);

      if (cancelled) return;

      // Validate settings against available languages
      let { language, version } = saved;
      const langEntry = getLanguage(language, languages);

      if (!langEntry) {
        // Saved language not available — fall back to first available
        if (languages.length > 0) {
          language = languages[0].code;
          version = languages[0].versions[0]?.code ?? version;
        }
        // if languages is empty, keep saved settings as-is
      } else {
        // Language exists — validate version
        const versionExists = langEntry.versions.some((v) => v.code === version);
        if (!versionExists) {
          version = langEntry.versions[0]?.code ?? version;
        }
      }

      const normalized: AppSettings = { ...saved, language, version };

      setSettings(normalized);
      setAvailableLanguages(languages);
      setLoaded(true);

      // Persist if language or version was corrected
      if (normalized.language !== saved.language || normalized.version !== saved.version) {
        saveSettings(normalized);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [db]);

  // Sync theme to visual appearance whenever it changes
  useEffect(() => {
    if (loaded) {
      Appearance.setColorScheme(settings.theme === "dark" ? "dark" : "light");
    }
  }, [settings.theme, loaded]);

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
      value={{ settings, availableLanguages, languagesError, updateSetting, setAllSettings }}
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
