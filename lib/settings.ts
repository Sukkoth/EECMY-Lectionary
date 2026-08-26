import * as SecureStore from "expo-secure-store";
import { Platform, Appearance } from "react-native";
import { isDevice24Hour } from "./timeFormat";

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
  | "playfair"
  | "serif"
  | "sans"
  | "mono";

export type AppSettings = {
  language: string;
  appLanguage: AppLanguage;
  version: string;
  showVersionFullName: boolean;
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
  versionUsageCount: Record<string, number>;
};

const KEYS = {
  language: "yeilet_language",
  appLanguage: "yeilet_app_language",
  version: "yeilet_version",
  showVersionFullName: "yeilet_show_version_full_name",
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
  versionUsageCount: "yeilet_version_usage_count",
  onboardingComplete: "yeilet_onboarding_complete",
};

const DEFAULTS: AppSettings = {
  language: "am",
  appLanguage: "en",
  version: "am54",
  showVersionFullName: false,
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
  versionUsageCount: {},
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const [
      language,
      appLanguage,
      version,
      showVersionFullName,
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
      rawUsageCount,
    ] = await Promise.all([
      SecureStore.getItemAsync(KEYS.language),
      SecureStore.getItemAsync(KEYS.appLanguage),
      SecureStore.getItemAsync(KEYS.version),
      SecureStore.getItemAsync(KEYS.showVersionFullName),
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
      SecureStore.getItemAsync(KEYS.versionUsageCount),
    ]);

    const systemTheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
    let versionUsageCount: Record<string, number> = {};
    if (rawUsageCount) {
      try {
        versionUsageCount = JSON.parse(rawUsageCount);
      } catch {}
    }

    return {
      language: language ?? DEFAULTS.language,
      appLanguage: appLanguage as AppLanguage || 'en',
      version: version ?? DEFAULTS.version,
      showVersionFullName: showVersionFullName === "true",
      fontSizeSimple: fontSizeSimple ? safeParseInt(fontSizeSimple, DEFAULTS.fontSizeSimple) : DEFAULTS.fontSizeSimple,
      fontSizeExpanded: fontSizeExpanded ? safeParseInt(fontSizeExpanded, DEFAULTS.fontSizeExpanded) : DEFAULTS.fontSizeExpanded,
      alignSimple: parseAlignment(alignSimple, DEFAULTS.alignSimple),
      alignExpanded: parseAlignment(alignExpanded, DEFAULTS.alignExpanded),
      readingFontFamily: parseReadingFontFamily(readingFontFamily, DEFAULTS.readingFontFamily),
      theme: theme === "light" || theme === "dark" ? theme : systemTheme,
      calendarStyle: calendarStyle === "ethiopian" || calendarStyle === "gregorian" ? calendarStyle : DEFAULTS.calendarStyle,
      showSeasonColors: showSeasonColors === null ? true : showSeasonColors === "true",
      reminderEnabled: reminderEnabled === "true",
      reminderTime: reminderTime ?? DEFAULTS.reminderTime,
      timeFormat: timeFormat === "24h" ? "24h" : "12h",
      versionUsageCount,
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
    SecureStore.setItemAsync(KEYS.showVersionFullName, String(settings.showVersionFullName)),
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
    SecureStore.setItemAsync(KEYS.versionUsageCount, JSON.stringify(settings.versionUsageCount ?? {})),
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
    "playfair",
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
    case "playfair":
      return "Playfair";
    case "serif":
      return Platform.OS === "ios" ? "Georgia" : "serif";
    case "sans":
      return Platform.OS === "ios" ? "System" : "sans-serif";
    case "mono":
      return Platform.OS === "ios" ? "Courier" : "monospace";
    case "inter":
    case "reading":
    default:
      return "Inter";
  }
}

/** Formats HH:mm string to 12h/24h display format based on setting or device locale */
export function formatTimeString(timeStr: string, format?: TimeFormat): string {
  const [hStr, mStr] = (timeStr || "07:00").split(":");
  const parsedH = parseInt(hStr, 10);
  const parsedM = parseInt(mStr, 10);
  const h = isNaN(parsedH) ? 7 : parsedH;
  const m = isNaN(parsedM) ? 0 : parsedM;
  const is24 = format !== undefined ? format === "24h" : isDevice24Hour();
  if (is24) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMin = String(m).padStart(2, "0");
  return `${displayHour}:${displayMin} ${period}`;
}
