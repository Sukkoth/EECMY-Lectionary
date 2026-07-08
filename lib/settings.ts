import * as SecureStore from "expo-secure-store";
import { isValidVersion, getLanguage, LANGUAGES } from "./languages";

export type TextAlignment = "left" | "center" | "justify";

export type AppSettings = {
  language: string;
  version: string;
  fontSizeSimple: number;
  fontSizeExpanded: number;
  alignSimple: TextAlignment;
  alignExpanded: TextAlignment;
};

const KEYS = {
  language: "yeilet_language",
  version: "yeilet_version",
  fontSizeSimple: "yeilet_font_size_simple",
  fontSizeExpanded: "yeilet_font_size_expanded",
  alignSimple: "yeilet_align_simple",
  alignExpanded: "yeilet_align_expanded",
};

const DEFAULTS: AppSettings = {
  language: "en",
  version: "niv",
  fontSizeSimple: 20,
  fontSizeExpanded: 18,
  alignSimple: "center",
  alignExpanded: "justify",
};

export async function loadSettings(): Promise<AppSettings> {
  const [language, version, fontSizeSimple, fontSizeExpanded, alignSimple, alignExpanded] =
    await Promise.all([
      SecureStore.getItemAsync(KEYS.language),
      SecureStore.getItemAsync(KEYS.version),
      SecureStore.getItemAsync(KEYS.fontSizeSimple),
      SecureStore.getItemAsync(KEYS.fontSizeExpanded),
      SecureStore.getItemAsync(KEYS.alignSimple),
      SecureStore.getItemAsync(KEYS.alignExpanded),
    ]);

  const lang = language
    ? getLanguage(language) ?? getLanguageByDisplayName(language)
    : null;

  const ver =
    lang && version && isValidVersion(lang.code, version)
      ? version
      : lang
        ? lang.versions[0].code
        : DEFAULTS.version;

  const result: AppSettings = {
    language: lang?.code ?? DEFAULTS.language,
    version: ver,
    fontSizeSimple: fontSizeSimple ? safeParseInt(fontSizeSimple, DEFAULTS.fontSizeSimple) : DEFAULTS.fontSizeSimple,
    fontSizeExpanded: fontSizeExpanded ? safeParseInt(fontSizeExpanded, DEFAULTS.fontSizeExpanded) : DEFAULTS.fontSizeExpanded,
    alignSimple: parseAlignment(alignSimple, DEFAULTS.alignSimple),
    alignExpanded: parseAlignment(alignExpanded, DEFAULTS.alignExpanded),
  };

  // Persist any normalization
  if (lang && (lang.code !== language || ver !== version)) {
    await saveSettings(result);
  }

  return result;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.language, settings.language),
    SecureStore.setItemAsync(KEYS.version, settings.version),
    SecureStore.setItemAsync(KEYS.fontSizeSimple, String(settings.fontSizeSimple)),
    SecureStore.setItemAsync(KEYS.fontSizeExpanded, String(settings.fontSizeExpanded)),
    SecureStore.setItemAsync(KEYS.alignSimple, settings.alignSimple),
    SecureStore.setItemAsync(KEYS.alignExpanded, settings.alignExpanded),
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

function getLanguageByDisplayName(name: string) {
  return LANGUAGES.find((l) => l.language === name);
}


