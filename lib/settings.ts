import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type TextAlignment = "left" | "center" | "justify";
export type CalendarStyle = "gregorian" | "ethiopian";
type AppLanguage = "am" | "en" | "om";
type TimeFormat = "12h" | "24h";
export type ReadingFontFamily =
  | "reading"
  | "benaiah"
  | "abyssinica"
  | "lora"
  | "merriweather"
  | "noto-ethiopic"
  | "bitter"
  | "cormorant"
  | "inter"
  | "serif"
  | "sans"
  | "mono";

export type AppSettings = {
  language: string;
  appLanguage: AppLanguage;
  version: string;
  fontSizeSimple: number;
  fontSizeExpanded: number;
  alignSimple: TextAlignment;
  alignExpanded: TextAlignment;
  readingFontFamily: ReadingFontFamily;
  theme: "light" | "dark";
  calendarStyle: CalendarStyle;
  showSeasonColors: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:mm" format, e.g. "07:00"
  timeFormat: TimeFormat;
};

const KEYS = {
  language: "yeilet_language",
  appLanguage: "yeilet_app_language",
  version: "yeilet_version",
  fontSizeSimple: "yeilet_font_size_simple",
  fontSizeExpanded: "yeilet_font_size_expanded",
  alignSimple: "yeilet_align_simple",
  alignExpanded: "yeilet_align_expanded",
  readingFontFamily: "yeilet_reading_font_family",
  theme: "yeilet_theme",
  calendarStyle: "yeilet_calendar_style",
  showSeasonColors: "yeilet_show_season_colors",
  reminderEnabled: "yeilet_reminder_enabled",
  reminderTime: "yeilet_reminder_time",
  timeFormat: "yeilet_time_format",
  onboardingComplete: "yeilet_onboarding_complete",
};

const DEFAULTS: AppSettings = {
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
  showSeasonColors: true,
  reminderEnabled: false,
  reminderTime: "08:30",
  timeFormat: "24h",
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const [
      language,
      appLanguage,
      version,
      fontSizeSimple,
      fontSizeExpanded,
      alignSimple,
      alignExpanded,
      readingFontFamily,
      theme,
      calendarStyle,
      showSeasonColors,
      reminderEnabled,
      reminderTime,
      timeFormat,
    ] = await Promise.all([
      SecureStore.getItemAsync(KEYS.language),
      SecureStore.getItemAsync(KEYS.appLanguage),
      SecureStore.getItemAsync(KEYS.version),
      SecureStore.getItemAsync(KEYS.fontSizeSimple),
      SecureStore.getItemAsync(KEYS.fontSizeExpanded),
      SecureStore.getItemAsync(KEYS.alignSimple),
      SecureStore.getItemAsync(KEYS.alignExpanded),
      SecureStore.getItemAsync(KEYS.readingFontFamily),
      SecureStore.getItemAsync(KEYS.theme),
      SecureStore.getItemAsync(KEYS.calendarStyle),
      SecureStore.getItemAsync(KEYS.showSeasonColors),
      SecureStore.getItemAsync(KEYS.reminderEnabled),
      SecureStore.getItemAsync(KEYS.reminderTime),
      SecureStore.getItemAsync(KEYS.timeFormat),
    ]);

    return {
      language: language ?? DEFAULTS.language,
      appLanguage: appLanguage as AppLanguage || 'en',
      version: version ?? DEFAULTS.version,
      fontSizeSimple: fontSizeSimple ? safeParseInt(fontSizeSimple, DEFAULTS.fontSizeSimple) : DEFAULTS.fontSizeSimple,
      fontSizeExpanded: fontSizeExpanded ? safeParseInt(fontSizeExpanded, DEFAULTS.fontSizeExpanded) : DEFAULTS.fontSizeExpanded,
      alignSimple: parseAlignment(alignSimple, DEFAULTS.alignSimple),
      alignExpanded: parseAlignment(alignExpanded, DEFAULTS.alignExpanded),
      readingFontFamily: parseReadingFontFamily(readingFontFamily, DEFAULTS.readingFontFamily),
      theme: theme === "light" || theme === "dark" ? theme : DEFAULTS.theme,
      calendarStyle: calendarStyle === "ethiopian" || calendarStyle === "gregorian" ? calendarStyle : DEFAULTS.calendarStyle,
      showSeasonColors: showSeasonColors === null ? true : showSeasonColors === "true",
      reminderEnabled: reminderEnabled === "true",
      reminderTime: reminderTime ?? DEFAULTS.reminderTime,
      timeFormat: timeFormat === "24h" ? "24h" : "12h",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.language, settings.language),
    SecureStore.setItemAsync(KEYS.appLanguage, settings.appLanguage),
    SecureStore.setItemAsync(KEYS.version, settings.version),
    SecureStore.setItemAsync(KEYS.fontSizeSimple, String(settings.fontSizeSimple)),
    SecureStore.setItemAsync(KEYS.fontSizeExpanded, String(settings.fontSizeExpanded)),
    SecureStore.setItemAsync(KEYS.alignSimple, settings.alignSimple),
    SecureStore.setItemAsync(KEYS.alignExpanded, settings.alignExpanded),
    SecureStore.setItemAsync(KEYS.readingFontFamily, settings.readingFontFamily),
    SecureStore.setItemAsync(KEYS.theme, settings.theme),
    SecureStore.setItemAsync(KEYS.calendarStyle, settings.calendarStyle),
    SecureStore.setItemAsync(KEYS.showSeasonColors, String(settings.showSeasonColors)),
    SecureStore.setItemAsync(KEYS.reminderEnabled, String(settings.reminderEnabled)),
    SecureStore.setItemAsync(KEYS.reminderTime, settings.reminderTime),
    SecureStore.setItemAsync(KEYS.timeFormat, settings.timeFormat),
  ]);
}

export async function loadOnboardingComplete(): Promise<boolean> {
  try {
    const val = await SecureStore.getItemAsync(KEYS.onboardingComplete);
    return val === "true";
  } catch {
    return false;
  }
}

export async function saveOnboardingComplete(complete: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.onboardingComplete, String(complete));
}

function safeParseInt(value: string, fallback: number): number {
  const n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

function parseAlignment(value: string | null, fallback: TextAlignment): TextAlignment {
  if (value === "left" || value === "center" || value === "justify") return value;
  return fallback;
}

function parseReadingFontFamily(value: string | null, fallback: ReadingFontFamily): ReadingFontFamily {
  const valid: ReadingFontFamily[] = [
    "reading",
    "benaiah",
    "abyssinica",
    "lora",
    "merriweather",
    "noto-ethiopic",
    "bitter",
    "cormorant",
    "inter",
    "serif",
    "sans",
    "mono",
  ];
  if (value && valid.includes(value as ReadingFontFamily)) return value as ReadingFontFamily;
  return fallback;
}

export function getReadingFontFamily(key?: string): string {
  switch (key) {
    case "benaiah":
      return "Benaiah";
    case "abyssinica":
      return "AbyssinicaSIL";
    case "lora":
      return "Lora";
    case "merriweather":
      return "Merriweather";
    case "noto-ethiopic":
      return "NotoSerifEthiopic";
    case "bitter":
      return "Bitter";
    case "cormorant":
      return "CormorantGaramond";
    case "inter":
      return "Inter";
    case "serif":
      return Platform.OS === "ios" ? "Georgia" : "serif";
    case "sans":
      return Platform.OS === "ios" ? "System" : "sans-serif";
    case "mono":
      return Platform.OS === "ios" ? "Courier" : "monospace";
    case "reading":
    default:
      return "ReadingFont";
  }
}
