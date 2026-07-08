import * as SecureStore from "expo-secure-store";
import { isValidVersion, getLanguage, LANGUAGES } from "./languages";

const KEYS = {
  language: "yeilet_language",
  version: "yeilet_version",
};

export type LanguageSetting = {
  language: string;
  version: string;
};

export async function loadLanguageSetting(): Promise<LanguageSetting | null> {
  const [language, version] = await Promise.all([
    SecureStore.getItemAsync(KEYS.language),
    SecureStore.getItemAsync(KEYS.version),
  ]);

  if (!language || !version) return null;

  // Normalize display-name to code (e.g. "English" → "en")
  const lang = getLanguage(language) ?? getLanguageByDisplayName(language);
  if (!lang) return null;

  // Normalize version — if not valid for the language, use default
  const ver = isValidVersion(lang.code, version) ? version : lang.versions[0].code;

  if (lang.code !== language || ver !== version) {
    await saveLanguageSetting({ language: lang.code, version: ver });
  }

  return { language: lang.code, version: ver };
}

export async function saveLanguageSetting(setting: LanguageSetting): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.language, setting.language),
    SecureStore.setItemAsync(KEYS.version, setting.version),
  ]);
}

function getLanguageByDisplayName(name: string) {
  return LANGUAGES.find((l) => l.language === name);
}
