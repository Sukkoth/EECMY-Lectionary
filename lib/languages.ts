export type LanguageEntry = {
  language: string;
  code: string;
  versions: { code: string; label: string }[];
};

export const LANGUAGES: LanguageEntry[] = [
  {
    language: "English",
    code: "en",
    versions: [
      { code: "kjv", label: "King James Version" },
      { code: "niv", label: "New International Version" },
    ],
  },
  {
    language: "አማርኛ",
    code: "am",
    versions: [
      { code: "am95", label: "አማርኛ 1954" },
      { code: "nasv", label: "NASV" },
    ],
  },
];

export function getLanguage(code: string): LanguageEntry | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export function getDefaultVersion(code: string): string | undefined {
  return getLanguage(code)?.versions[0]?.code;
}

export function isValidVersion(langCode: string, versionCode: string): boolean {
  return getLanguage(langCode)?.versions.some((v) => v.code === versionCode) ?? false;
}
