import type { SQLiteDatabase, SQLiteBindValue } from "expo-sqlite";
import { CONTENT_BASE_URL } from "./config";
import type {
  DayInfoPackage,
  HolidayPackage,
  Manifest,
  ReadingsPackage,
} from "./types";

const JSDELIVR_HEADERS = {
  Accept: "application/json",
};

async function fetchJSON<T>(url: string): Promise<T> {
  /**
   * Add query param `t` to bypass caching
   */
  const res = await fetch(`${url}?t=${Date.now()}`, { headers: JSDELIVR_HEADERS });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchManifest(): Promise<Manifest> {
  return fetchJSON<Manifest>(`${CONTENT_BASE_URL}/manifest.json`);
}

export async function downloadDayInfo(path: string): Promise<DayInfoPackage> {
  return fetchJSON<DayInfoPackage>(`${CONTENT_BASE_URL}/${path}`);
}

export async function downloadHolidays(path: string): Promise<HolidayPackage> {
  return fetchJSON<HolidayPackage>(`${CONTENT_BASE_URL}/${path}`);
}

export async function downloadReadings(path: string): Promise<ReadingsPackage> {
  return fetchJSON<ReadingsPackage>(`${CONTENT_BASE_URL}/${path}`);
}

function generateDayInfoId(lang: string, date: string): string {
  return `dayinfo:${lang}:${date}`;
}

function generateHolidayId(lang: string, date: string, name: string): string {
  return `holiday:${lang}:${date}:${name}`;
}

function generateReadingId(
  lang: string,
  version: string,
  date: string,
  order: number,
): string {
  return `reading:${lang}:${version}:${date}:${order}`;
}

function generateSyncId(
  type: string,
  year: number,
  lang: string,
  version: string,
): string {
  return `sync:${type}:${year}:${lang}:${version}`;
}

export type PreparedStatement = {
  sql: string;
  params: SQLiteBindValue[];
};

export type PreparedDayInfo = {
  statements: PreparedStatement[];
};

export type PreparedHolidays = {
  statements: PreparedStatement[];
};

export type PreparedReadings = {
  statements: PreparedStatement[];
};

export function prepareDayInfo(
  pkg: DayInfoPackage,
  lang: string,
): PreparedDayInfo {
  const statements: PreparedStatement[] = [];

  for (const row of pkg.dayInfo) {
    statements.push({
      sql: `INSERT OR REPLACE INTO DayInfo (id, language, date, title, description)
            VALUES (?, ?, ?, ?, ?)`,
      params: [
        generateDayInfoId(lang, row.date),
        lang,
        row.date,
        row.title,
        row.description,
      ],
    });
  }

  return { statements };
}

export function prepareHolidays(
  pkg: HolidayPackage,
  lang: string,
): PreparedHolidays {
  const statements: PreparedStatement[] = [];

  for (const row of pkg.holidays) {
    statements.push({
      sql: `INSERT OR REPLACE INTO Holiday (id, language, date, type, name)
            VALUES (?, ?, ?, ?, ?)`,
      params: [
        generateHolidayId(lang, row.date, row.name),
        lang,
        row.date,
        row.type,
        row.name,
      ],
    });
  }

  return { statements };
}

export function prepareReadings(
  pkg: ReadingsPackage,
  lang: string,
  version: string,
): PreparedReadings {
  const statements: PreparedStatement[] = [];

  for (const row of pkg.readings) {
    statements.push({
      sql: `INSERT OR REPLACE INTO Reading (id, language, version, date, "order", section, reference, text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        generateReadingId(lang, version, row.date, row.order),
        lang,
        version,
        row.date,
        row.order,
        row.section,
        row.reference,
        row.text,
      ],
    });
  }

  return { statements };
}

export function prepareSyncRecord(
  year: number,
  lang: string,
  langFullName: string,
  version: string | null,
  versionFullName: string | null,
  type: string,
  checksum: string,
): PreparedStatement {
  return {
    sql: `INSERT OR REPLACE INTO SyncRecord
          (id, type, language, languageFullName, version, versionFullName, year, checksum, pulledAt, contentVersion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1)`,
    params: [
      generateSyncId(type, year, lang, version ?? "none"),
      type,
      lang,
      langFullName,
      version ?? "",
      versionFullName ?? "",
      year,
      checksum,
    ],
  };
}

export async function commitStatements(
  db: SQLiteDatabase,
  stmts: PreparedStatement[],
): Promise<void> {
  // TODO: uncomment when DB writes are enabled
  await db.withTransactionAsync(async () => {
    for (const stmt of stmts) {
      await db.runAsync(stmt.sql, ...stmt.params);
    }
  });
}
