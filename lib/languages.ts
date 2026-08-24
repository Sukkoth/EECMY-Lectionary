import type { SQLiteDatabase } from "expo-sqlite";

export type LanguageEntry = {
  language: string;
  code: string;
  versions: { code: string; label: string }[];
};

/**
 * Fetches available (language, version) pairs dynamically from the DB,
 * joining SyncRecord for human-readable display names, groups them by language,
 * and returns LanguageEntry[].
 * Runs once on app start — results are cached in SettingsContext.
 */
export async function getAvailableLanguages(
  db: SQLiteDatabase,
): Promise<LanguageEntry[]> {

  const rows = await db.getAllAsync<{
    language: string;
    languageFullName: string;
    version: string;
    versionFullName: string;
  }>(
    `SELECT DISTINCT 
       r.language,
       COALESCE(
         (SELECT languageFullName FROM SyncRecord WHERE LOWER(language) = LOWER(r.language) AND languageFullName IS NOT NULL AND languageFullName != '' LIMIT 1),
         r.language
       ) AS languageFullName,
       r.version,
       COALESCE(
         (SELECT versionFullName FROM SyncRecord WHERE LOWER(language) = LOWER(r.language) AND LOWER(version) = LOWER(r.version) AND versionFullName IS NOT NULL AND versionFullName != '' LIMIT 1),
         UPPER(r.version)
       ) AS versionFullName
     FROM Reading r
     ORDER BY r.language, r.version`,
  );

  const grouped = new Map<
    string,
    { languageFullName: string; versions: Map<string, string> }
  >();

  for (const row of rows) {
    let entry = grouped.get(row.language);
    if (!entry) {
      entry = { languageFullName: row.languageFullName, versions: new Map() };
      grouped.set(row.language, entry);
    }
    entry.versions.set(row.version, row.versionFullName);
  }

  const result: LanguageEntry[] = [];

  for (const [code, { languageFullName, versions }] of grouped) {
    result.push({
      language: languageFullName,
      code,
      versions: Array.from(versions.entries()).map(([vCode, vLabel]) => ({
        code: vCode,
        label: vLabel,
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

/** Get default version code for a language from a given list. */
function getDefaultVersion(
  code: string,
  languages: LanguageEntry[],
): string | undefined {
  return getLanguage(code, languages)?.versions[0]?.code;
}

/** Check if a version code exists for a language in a given list. */
function isValidVersion(
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
