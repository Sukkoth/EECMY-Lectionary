import type { SQLiteDatabase } from "expo-sqlite";

export const DEFAULT_LANG = "en";
export const DEFAULT_VERSION = "niv";

export type ReadingRow = {
  order: number;
  section: "OLD_TESTAMENT" | "EPISTLE" | "GOSPEL";
  reference: string;
  text: string;
  version: string;
};

export type DayData = {
  date: Date;
  readings: ReadingRow[];
  dayInfo: { title: string | null; description: string | null } | null;
};

/** Format a Date to YYYY-MM-DD using local timezone */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string to a Date (local timezone, midnight) */
function fromDateString(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export class ReadingsDB {
  constructor(private db: SQLiteDatabase) {}

  /**
   * Retrieves readings within a date range and groups them by date.
   *
   * Each date contains its associated readings and optional day information
   * such as title and description.
   */
  async getReadingsForDateRange(
    startDate: Date,
    endDate: Date,
    language = DEFAULT_LANG,
    version = DEFAULT_VERSION,
  ): Promise<DayData[]> {
    const startStr = toDateString(startDate);
    const endStr = toDateString(endDate);

    const rows = await this.db.getAllAsync<{
      date: string;
      order: number;
      section: string;
      reference: string;
      text: string;
      version: string;
      title: string | null;
      description: string | null;
    }>(
      `SELECT r.date, r."order", r.section, r.reference, r.text, r."version",
              d.title, d.description
       FROM Reading r
       LEFT JOIN DayInfo d ON d.language = r.language AND d.date = r.date
       WHERE r.language = ? AND r.version = ? AND r.date >= ? AND r.date <= ?
       ORDER BY r.date, r."order" ASC`,
      [language, version, startStr, endStr],
    );

    const grouped = new Map<string, DayData>();

    for (const row of rows) {
      const dateKey = row.date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: fromDateString(dateKey),
          readings: [],
          dayInfo: row.title != null ? { title: row.title, description: row.description } : null,
        });
      }

      const day = grouped.get(dateKey)!;
      day.readings.push({
        order: row.order,
        version: row.version,
        section: row.section as "OLD_TESTAMENT" | "EPISTLE" | "GOSPEL",
        reference: row.reference,
        text: row.text,
      });
    }

    return Array.from(grouped.values());
  }

  async getReadingsForDate(
    date: Date,
    language = DEFAULT_LANG,
    version = DEFAULT_VERSION,
  ): Promise<DayData | null> {
    const results = await this.getReadingsForDateRange(date, date, language, version);
    return results[0] ?? null;
  }
}
