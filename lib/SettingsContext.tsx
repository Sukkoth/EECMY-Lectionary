import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadSettings, saveSettings, type AppSettings, type TextAlignment } from "./settings";

type SettingsContextValue = {
  settings: AppSettings;
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
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((saved) => {
      setSettings(saved);
      setLoaded(true);
    });
  }, []);

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
