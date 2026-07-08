import type { SQLiteDatabase } from "expo-sqlite";
import { ReadingsDB, toDateString, type DayData } from "./database";

const CACHE_KEEP_DAYS = 30;

export class ReadingRepository {
  private cache = new Map<string, DayData | null>();
  private readingsDB: ReadingsDB;
  private language: string;
  private version: string;

  constructor(db: SQLiteDatabase, language = "en", version = "niv") {
    this.readingsDB = new ReadingsDB(db);
    this.language = language;
    this.version = version;
  }

  /** Prefetch data for a range of dates, caching results (including null for empty dates). */
  async prefetch(dates: Date[]): Promise<void> {
    const uncached = dates.filter((d) => !this.cache.has(toDateString(d)));
    if (uncached.length === 0) return;

    const days = await this.readingsDB.getReadingsForDateRange(
      uncached[0],
      uncached[uncached.length - 1],
      this.language,
      this.version,
    );

    for (const day of days) {
      this.cache.set(toDateString(day.date), day);
    }

    // Mark uncached dates with no data as null to avoid re-querying
    for (const d of uncached) {
      const key = toDateString(d);
      if (!this.cache.has(key)) {
        this.cache.set(key, null);
      }
    }
  }

  /** Get cached data for a single date. Returns undefined if not yet loaded. */
  getCached(date: Date): DayData | null | undefined {
    return this.cache.get(toDateString(date));
  }

  /** Remove entries far from the given center date to bound memory growth. */
  prune(centerDate: Date): void {
    const center = centerDate.getTime();
    const maxAge = CACHE_KEEP_DAYS * 24 * 60 * 60 * 1000;
    for (const [key] of this.cache) {
      const [y, m, d] = key.split("-").map(Number);
      const dateTime = new Date(y, m - 1, d).getTime();
      if (Math.abs(dateTime - center) > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

/** Number of days on each side of the center in the pager window. */
export const HALF_WINDOW = 10;
/** Total number of pages in the pager. */
export const WINDOW_SIZE = HALF_WINDOW * 2 + 1; // 21
/** Rebuild the window when the user reaches this close to either edge. */
export const REBUILD_THRESHOLD = 1;

/** Generate a 21-day window centered on the given date. */
export function generateWindow(center: Date): Date[] {
  const dates: Date[] = [];
  for (let i = -HALF_WINDOW; i <= HALF_WINDOW; i++) {
    const d = new Date(center);
    d.setDate(center.getDate() + i);
    dates.push(d);
  }
  return dates;
}
