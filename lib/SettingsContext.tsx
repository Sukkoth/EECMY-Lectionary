import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadLanguageSetting, saveLanguageSetting } from "./settings";

export type AppSettings = {
  language: string;
  version: string;
};

type SettingsContextValue = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  setAllSettings: (next: AppSettings) => Promise<void>;
};

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  version: "niv",
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadLanguageSetting().then((saved) => {
      if (saved) {
        setSettings(saved);
      }
      setLoaded(true);
    });
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveLanguageSetting(next);
  };

  const setAllSettings = async (next: AppSettings) => {
    setSettings(next);
    await saveLanguageSetting(next);
  };

  if (!loaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, setAllSettings }}>
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
