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

function generateHolidayId(lang: string, date: string, index: number): string {
  return `holiday:${lang}:${date}:${index}`;
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
  expectedVersion?: number,
): PreparedDayInfo {
  if (expectedVersion != null && pkg.version != null && pkg.version !== expectedVersion) {
    throw new Error(
      `DayInfo version mismatch for ${lang.toUpperCase()}: manifest requested v${expectedVersion}, but downloaded package contains v${pkg.version}.`
    );
  }

  const statements: PreparedStatement[] = [];

  for (const row of pkg.dayInfo) {
    statements.push({
      sql: `INSERT OR REPLACE INTO DayInfo (id, language, date, title, description, seasonColor)
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [
        generateDayInfoId(lang, row.date),
        lang,
        row.date,
        row.title ?? null,
        row.description ?? null,
        row.seasonColor ?? null,
      ],
    });
  }

  return { statements };
}

export function prepareHolidays(
  pkg: HolidayPackage,
  lang: string,
  expectedVersion?: number,
): PreparedHolidays {
  if (expectedVersion != null && pkg.version != null && pkg.version !== expectedVersion) {
    throw new Error(
      `Holidays version mismatch for ${lang.toUpperCase()}: manifest requested v${expectedVersion}, but downloaded package contains v${pkg.version}.`
    );
  }

  const statements: PreparedStatement[] = [];
  const dateCounts: Record<string, number> = {};

  for (const row of pkg.holidays) {
    const index = dateCounts[row.date] ?? 0;
    dateCounts[row.date] = index + 1;

    statements.push({
      sql: `INSERT OR REPLACE INTO Holiday (id, language, date, endDate, type, name)
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [
        generateHolidayId(lang, row.date, index),
        lang,
        row.date,
        row.endDate ?? null,
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
  expectedVersion?: number,
): PreparedReadings {
  if (!pkg || !Array.isArray(pkg.readings) || pkg.readings.length === 0) {
    throw new Error(`The content package for ${version.toUpperCase()} is empty or invalid.`);
  }

  if (expectedVersion != null && pkg.version != null && pkg.version !== expectedVersion) {
    throw new Error(
      `Content version mismatch for ${version.toUpperCase()}: manifest requested v${expectedVersion}, but downloaded file contains v${pkg.version}.`
    );
  }

  const statements: PreparedStatement[] = [];

  for (let i = 0; i < pkg.readings.length; i++) {
    const row = pkg.readings[i];
    if (!row.date || typeof row.date !== "string") {
      throw new Error(`Invalid data item #${i + 1} for ${version.toUpperCase()}: missing date.`);
    }
    if (!row.reference || typeof row.reference !== "string" || !row.reference.trim()) {
      throw new Error(`Invalid data for ${row.date} (${version.toUpperCase()}): missing scripture reference.`);
    }
    if (!row.text || typeof row.text !== "string" || !row.text.trim()) {
      throw new Error(`Invalid data for ${row.date} (${row.reference}): missing scripture text.`);
    }

    statements.push({
      sql: `INSERT OR REPLACE INTO Reading (id, language, version, date, "order", section, reference, text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        generateReadingId(lang, version, row.date, row.order ?? 0),
        lang,
        version,
        row.date,
        row.order ?? 0,
        row.section ?? "READING",
        row.reference.trim(),
        row.text.trim(),
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
  contentVersion: number,
): PreparedStatement {
  return {
    sql: `INSERT OR REPLACE INTO SyncRecord
          (id, type, language, languageFullName, version, versionFullName, year, checksum, pulledAt, contentVersion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
    params: [
      generateSyncId(type, year, lang, version ?? "none"),
      type,
      lang,
      langFullName,
      version ?? "",
      versionFullName ?? "",
      year,
      checksum,
      contentVersion,
    ],
  };
}

let dbTransactionMutex: Promise<void> = Promise.resolve();

export async function commitStatements(
  db: SQLiteDatabase,
  stmts: PreparedStatement[],
): Promise<void> {
  // Chain transaction onto the mutex queue so only 1 SQLite transaction executes at a time
  const nextLock = dbTransactionMutex.then(async () => {
    await db.withTransactionAsync(async () => {
      const statementCache = new Map<string, any>();
      try {
        for (const stmt of stmts) {
          let prep = statementCache.get(stmt.sql);
          if (!prep) {
            prep = await db.prepareAsync(stmt.sql);
            statementCache.set(stmt.sql, prep);
          }
          await prep.executeAsync(stmt.params);
        }
      } finally {
        for (const prep of statementCache.values()) {
          await prep.finalizeAsync().catch(() => {});
        }
      }
    });
  });

  // Keep mutex chain intact even if a transaction fails
  dbTransactionMutex = nextLock.catch(() => {});

  // Await the current transaction completion
  return nextLock;
}
