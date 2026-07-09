import type { SQLiteDatabase } from "expo-sqlite";

export type LanguageEntry = {
  language: string;
  code: string;
  versions: { code: string; label: string }[];
};

/** Static maps from DB-stored codes to human-readable display names */
//TODO: These will be removed for dynamic content later
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo"
};

export const VERSION_LABELS: Record<string, string> = {
  kjv: "King James Version",
  niv: "New International Version",
  am95: "አማርኛ 1954",
  nasv: "NASV",
  macqul: "Macaafa Qulqulluu",
  hha: "Hiika Haarawa Ammayyaa"
};

/**
 * Fetches available (language, version) pairs from the DB,
 * groups them by language, and returns LanguageEntry[].
 * Runs once on app start — results are cached in SettingsContext.
 */
export async function getAvailableLanguages(
  db: SQLiteDatabase,
): Promise<LanguageEntry[]> {
  const rows = await db.getAllAsync<{ language: string; version: string }>(
    `SELECT DISTINCT language, version FROM Reading ORDER BY language, version`,
  );

  const grouped = new Map<string, Set<string>>();

  for (const row of rows) {
    const existing = grouped.get(row.language);
    if (existing) {
      existing.add(row.version);
    } else {
      grouped.set(row.language, new Set([row.version]));
    }
  }

  const result: LanguageEntry[] = [];

  for (const [code, versions] of grouped) {
    result.push({
      language: LANGUAGE_NAMES[code] ?? code,
      code,
      versions: Array.from(versions).map((v) => ({
        code: v,
        label: VERSION_LABELS[v] ?? v.toUpperCase(),
      })),
    });
  }

  return result;
}

/** Find a language entry by code in a given list. */
export function getLanguage(
  code: string,
  languages: LanguageEntry[],
): LanguageEntry | undefined {
  return languages.find((l) => l.code === code);
}

/** Get the first version code for a language from a given list. */
export function getDefaultVersion(
  code: string,
  languages: LanguageEntry[],
): string | undefined {
  return getLanguage(code, languages)?.versions[0]?.code;
}

/** Check if a version code exists for a language in a given list. */
export function isValidVersion(
  langCode: string,
  versionCode: string,
  languages: LanguageEntry[],
): boolean {
  return (
    getLanguage(langCode, languages)?.versions.some(
      (v) => v.code === versionCode,
    ) ?? false
  );
}
