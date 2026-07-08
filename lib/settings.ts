import * as SecureStore from "expo-secure-store";

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

  if (language && version) {
    return { language, version };
  }

  return null;
}

export async function saveLanguageSetting(setting: LanguageSetting): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.language, setting.language),
    SecureStore.setItemAsync(KEYS.version, setting.version),
  ]);
}
