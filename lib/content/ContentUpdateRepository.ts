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
): Promise<{ version: string; versionFullName: string; pulledAt: string }[]> {
  return db.getAllAsync<{
    version: string;
    versionFullName: string;
    pulledAt: string;
  }>(
    `SELECT version, versionFullName, pulledAt
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
