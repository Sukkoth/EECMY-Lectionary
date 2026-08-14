import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import type { HolidayRow } from "../types";
import {
  ETHIOPIAN_MONTH_NAMES_SHORT_AM,
  ETHIOPIAN_MONTH_NAMES_SHORT_OM,
  ETHIOPIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_AM,
  GREGORIAN_MONTH_NAMES_SHORT_OM,
  GREGORIAN_MONTH_NAMES_SHORT_EN,
  gregorianToEthiopian,
} from "../ethiopianCalendar";

export const HOLIDAY_KEYS = {
  all: ["holidays"] as const,
  language: (language: string) => ["holidays", language] as const,
};

export type HolidayIndexEntry = {
  row: HolidayRow;
  /** Gregorian date components parsed once */
  gcYear: number;
  gcMonth: number; // 0-indexed
  gcDay: number;
  /** Ethiopian date components converted once */
  ethYear: number;
  ethMonth: number; // 0-indexed
  ethDay: number;
};

export type HolidayIndex = {
  /** Key: "YYYY-M" (GC, 0-indexed month) → entries that fall in that GC month */
  byGcMonth: Map<string, HolidayIndexEntry[]>;
  /** Key: "YYYY-M" (ETH, 0-indexed month) → entries that fall in that ETH month */
  byEthMonth: Map<string, HolidayIndexEntry[]>;
};

function buildHolidayIndex(rows: HolidayRow[]): HolidayIndex {
  const byGcMonth = new Map<string, HolidayIndexEntry[]>();
  const byEthMonth = new Map<string, HolidayIndexEntry[]>();

  for (const row of rows) {
    const [yStr, mStr, dStr] = row.date.split("-");
    const gcYear = parseInt(yStr, 10);
    const gcMonth = parseInt(mStr, 10) - 1; // 0-indexed
    const gcDay = parseInt(dStr, 10);

    // Convert once using noon UTC to prevent timezone drift
    const eth = gregorianToEthiopian(new Date(`${row.date}T12:00:00Z`));

    const entry: HolidayIndexEntry = {
      row,
      gcYear,
      gcMonth,
      gcDay,
      ethYear: eth.year,
      ethMonth: eth.month,
      ethDay: eth.day,
    };

    const gcKey = `${gcYear}-${gcMonth}`;
    const gcBucket = byGcMonth.get(gcKey);
    if (gcBucket) gcBucket.push(entry);
    else byGcMonth.set(gcKey, [entry]);

    const ethKey = `${eth.year}-${eth.month}`;
    const ethBucket = byEthMonth.get(ethKey);
    if (ethBucket) ethBucket.push(entry);
    else byEthMonth.set(ethKey, [entry]);
  }

  return { byGcMonth, byEthMonth };
}

export function useHolidays(language: string) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: HOLIDAY_KEYS.language(language),
    queryFn: async (): Promise<HolidayRow[]> => {
      let rows = await db.getAllAsync<HolidayRow>(
        "SELECT * FROM Holiday WHERE language = ? ORDER BY date",
        [language],
      );
      if (rows.length === 0 && language !== "am") {
        // Fall back to Amharic if requested language holidays are not available in SQLite DB
        rows = await db.getAllAsync<HolidayRow>(
          "SELECT * FROM Holiday WHERE language = 'am' ORDER BY date",
        );
      }
      return rows.map((row) => ({
        ...row,
        type: row.type.toLowerCase() as HolidayRow["type"],
      }));
    },
    // Build the index once when query data settles — O(n) only on load/language change
    select: buildHolidayIndex,
  });
}

export type DisplayHoliday = HolidayRow & {
  displayDay: number;
  displayMonthName: string;
};

export function getHolidaysForActiveMonth(
  index: HolidayIndex | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
  lang: string = "am",
): { map: Map<number, HolidayRow[]>; list: DisplayHoliday[] } {
  const map = new Map<number, HolidayRow[]>();
  const list: DisplayHoliday[] = [];

  if (!index) return { map, list };

  const ethShorts =
    lang === "om"
      ? ETHIOPIAN_MONTH_NAMES_SHORT_OM
      : lang === "en"
        ? ETHIOPIAN_MONTH_NAMES_SHORT_EN
        : ETHIOPIAN_MONTH_NAMES_SHORT_AM;
  const gcShorts =
    lang === "om"
      ? GREGORIAN_MONTH_NAMES_SHORT_OM
      : lang === "am"
        ? GREGORIAN_MONTH_NAMES_SHORT_AM
        : GREGORIAN_MONTH_NAMES_SHORT_EN;

  // O(1) lookup — only iterate the entries for the active month
  const key = `${activeYear}-${activeMonth}`;
  const entries = isEth
    ? (index.byEthMonth.get(key) ?? [])
    : (index.byGcMonth.get(key) ?? []);

  for (const entry of entries) {
    if (isEth) {
      const ethMonthName = ethShorts[entry.ethMonth] ?? "";
      const existing = map.get(entry.ethDay) ?? [];
      existing.push(entry.row);
      map.set(entry.ethDay, existing);
      list.push({ ...entry.row, displayDay: entry.ethDay, displayMonthName: ethMonthName });
    } else {
      const gcMonthName = gcShorts[entry.gcMonth] ?? "";
      const existing = map.get(entry.gcDay) ?? [];
      existing.push(entry.row);
      map.set(entry.gcDay, existing);
      list.push({ ...entry.row, displayDay: entry.gcDay, displayMonthName: gcMonthName });
    }
  }

  return { map, list };
}
