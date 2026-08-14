import type { SQLiteDatabase } from "expo-sqlite";

export type SyncRecordRow = {
  id: string;
  type: string;
  language: string;
  languageFullName: string;
  version: string;
  versionFullName: string;
  year: number;
  checksum: string;
  pulledAt: string;
  contentVersion: number;
};

export async function getSyncedYears(
  db: SQLiteDatabase,
): Promise<number[]> {
  const rows = await db.getAllAsync<{ year: number }>(
    `SELECT DISTINCT year FROM SyncRecord ORDER BY year DESC`,
  );
  return rows.map((r) => r.year);
}

export async function getSyncedReadingCounts(
  db: SQLiteDatabase,
): Promise<{ year: number; syncedCount: number }[]> {
  return db.getAllAsync<{ year: number; syncedCount: number }>(
    `SELECT year, COUNT(*) AS syncedCount
     FROM SyncRecord
     WHERE type = 'readings'
     GROUP BY year
     ORDER BY year DESC`,
  );
}

export async function getSyncedLangPackVersions(
  db: SQLiteDatabase,
): Promise<{ year: number; language: string; type: string; contentVersion: number }[]> {
  return db.getAllAsync<{ year: number; language: string; type: string; contentVersion: number }>(
    `SELECT year, language, type, contentVersion
     FROM SyncRecord
     WHERE type IN ('holidays', 'day-info')
     ORDER BY year DESC, language ASC`,
  );
}

export async function getSyncedReadingVersions(
  db: SQLiteDatabase,
): Promise<{ year: number; language: string; version: string; contentVersion: number }[]> {
  return db.getAllAsync<{ year: number; language: string; version: string; contentVersion: number }>(
    `SELECT year, language, version, contentVersion
     FROM SyncRecord
     WHERE type = 'readings'
     ORDER BY year DESC, language ASC, version ASC`,
  );
}

export async function getInstalledVersionsWithContentVersion(
  db: SQLiteDatabase,
): Promise<{ language: string; version: string; contentVersion: number }[]> {
  const rows = await db.getAllAsync<{
    language: string;
    version: string;
    contentVersion: number | null;
  }>(
    `SELECT DISTINCT 
       r.language, 
       r.version,
       MAX(s.contentVersion) AS contentVersion
     FROM Reading r
     LEFT JOIN SyncRecord s 
       ON LOWER(s.language) = LOWER(r.language) 
      AND LOWER(s.version) = LOWER(r.version)
      AND s.type = 'readings'
     GROUP BY r.language, r.version`,
  );

  return rows.map((row) => ({
    language: row.language,
    version: row.version,
    contentVersion: row.contentVersion ?? 1,
  }));
}

export async function getInstalledLangPacksWithContentVersion(
  db: SQLiteDatabase,
): Promise<{ language: string; type: "holidays" | "day-info"; contentVersion: number }[]> {
  const holidayRows = await db.getAllAsync<{ language: string; contentVersion: number | null }>(
    `SELECT DISTINCT 
       h.language, 
       MAX(s.contentVersion) AS contentVersion
     FROM Holiday h
     LEFT JOIN SyncRecord s 
       ON LOWER(s.language) = LOWER(h.language) 
      AND s.type = 'holidays'
     GROUP BY h.language`,
  );

  const dayInfoRows = await db.getAllAsync<{ language: string; contentVersion: number | null }>(
    `SELECT DISTINCT 
       d.language, 
       MAX(s.contentVersion) AS contentVersion
     FROM DayInfo d
     LEFT JOIN SyncRecord s 
       ON LOWER(s.language) = LOWER(d.language) 
      AND s.type = 'day-info'
     GROUP BY d.language`,
  );

  const results: { language: string; type: "holidays" | "day-info"; contentVersion: number }[] = [];

  for (const r of holidayRows) {
    results.push({ language: r.language, type: "holidays", contentVersion: r.contentVersion ?? 1 });
  }
  for (const r of dayInfoRows) {
    results.push({ language: r.language, type: "day-info", contentVersion: r.contentVersion ?? 1 });
  }

  return results;
}

export async function getDownloadedLangsForYear(
  db: SQLiteDatabase,
  year: number,
): Promise<{ lang: string; langFullName: string }[]> {
  return db.getAllAsync<{ lang: string; langFullName: string }>(
    `SELECT DISTINCT language AS lang, languageFullName AS langFullName
     FROM SyncRecord
     WHERE year = ?
     ORDER BY language`,
    [year],
  );
}

export async function getDownloadedVersionsForYearLang(
  db: SQLiteDatabase,
  year: number,
  lang: string,
): Promise<{ version: string; versionFullName: string; pulledAt: string; contentVersion: number }[]> {
  return db.getAllAsync<{
    version: string;
    versionFullName: string;
    pulledAt: string;
    contentVersion: number;
  }>(
    `SELECT version, versionFullName, pulledAt, contentVersion
     FROM SyncRecord
     WHERE year = ? AND language = ? AND type = 'readings'
     ORDER BY version`,
    [year, lang],
  );
}

export async function isContentDownloaded(
  db: SQLiteDatabase,
  year: number,
  lang: string,
  type: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM SyncRecord
     WHERE year = ? AND language = ? AND type = ?`,
    [year, lang, type],
  );
  return (row?.cnt ?? 0) > 0;
}
