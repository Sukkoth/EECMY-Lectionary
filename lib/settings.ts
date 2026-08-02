import * as SecureStore from "expo-secure-store";

export type TextAlignment = "left" | "center" | "justify";
export type CalendarStyle = "gregorian" | "ethiopian";

export type AppSettings = {
  language: string;
  version: string;
  fontSizeSimple: number;
  fontSizeExpanded: number;
  alignSimple: TextAlignment;
  alignExpanded: TextAlignment;
  theme: "light" | "dark";
  calendarStyle: CalendarStyle;
};

const KEYS = {
  language: "yeilet_language",
  version: "yeilet_version",
  fontSizeSimple: "yeilet_font_size_simple",
  fontSizeExpanded: "yeilet_font_size_expanded",
  alignSimple: "yeilet_align_simple",
  alignExpanded: "yeilet_align_expanded",
  theme: "yeilet_theme",
  calendarStyle: "yeilet_calendar_style",
  onboardingComplete: "yeilet_onboarding_complete",
};

const DEFAULTS: AppSettings = {
  language: "en",
  version: "niv",
  fontSizeSimple: 20,
  fontSizeExpanded: 18,
  alignSimple: "center",
  alignExpanded: "justify",
  theme: "light",
  calendarStyle: "ethiopian",
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const [language, version, fontSizeSimple, fontSizeExpanded, alignSimple, alignExpanded, theme, calendarStyle] =
      await Promise.all([
        SecureStore.getItemAsync(KEYS.language),
        SecureStore.getItemAsync(KEYS.version),
        SecureStore.getItemAsync(KEYS.fontSizeSimple),
        SecureStore.getItemAsync(KEYS.fontSizeExpanded),
        SecureStore.getItemAsync(KEYS.alignSimple),
        SecureStore.getItemAsync(KEYS.alignExpanded),
        SecureStore.getItemAsync(KEYS.theme),
        SecureStore.getItemAsync(KEYS.calendarStyle),
      ]);

    return {
      language: language ?? DEFAULTS.language,
      version: version ?? DEFAULTS.version,
      fontSizeSimple: fontSizeSimple ? safeParseInt(fontSizeSimple, DEFAULTS.fontSizeSimple) : DEFAULTS.fontSizeSimple,
      fontSizeExpanded: fontSizeExpanded ? safeParseInt(fontSizeExpanded, DEFAULTS.fontSizeExpanded) : DEFAULTS.fontSizeExpanded,
      alignSimple: parseAlignment(alignSimple, DEFAULTS.alignSimple),
      alignExpanded: parseAlignment(alignExpanded, DEFAULTS.alignExpanded),
      theme: theme === "light" || theme === "dark" ? theme : DEFAULTS.theme,
      calendarStyle: calendarStyle === "ethiopian" || calendarStyle === "gregorian" ? calendarStyle : DEFAULTS.calendarStyle,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.language, settings.language),
    SecureStore.setItemAsync(KEYS.version, settings.version),
    SecureStore.setItemAsync(KEYS.fontSizeSimple, String(settings.fontSizeSimple)),
    SecureStore.setItemAsync(KEYS.fontSizeExpanded, String(settings.fontSizeExpanded)),
    SecureStore.setItemAsync(KEYS.alignSimple, settings.alignSimple),
    SecureStore.setItemAsync(KEYS.alignExpanded, settings.alignExpanded),
    SecureStore.setItemAsync(KEYS.theme, settings.theme),
    SecureStore.setItemAsync(KEYS.calendarStyle, settings.calendarStyle),
  ]);
}

function safeParseInt(value: string, fallback: number): number {
  const n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

function parseAlignment(value: string | null, fallback: TextAlignment): TextAlignment {
  if (value === "left" || value === "center" || value === "justify") return value;
  return fallback;
}

export async function loadOnboardingComplete(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(KEYS.onboardingComplete);
    return value === "true";
  } catch {
    return false;
  }
}

export async function saveOnboardingComplete(complete: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.onboardingComplete, String(complete));
}
