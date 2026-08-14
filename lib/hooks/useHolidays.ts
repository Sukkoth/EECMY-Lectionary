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
    const startDate = new Date(`${row.date}T12:00:00Z`);
    const endDate = row.endDate ? new Date(`${row.endDate}T12:00:00Z`) : startDate;

    const curr = new Date(startDate.getTime());
    while (curr.getTime() <= endDate.getTime()) {
      const y = curr.getUTCFullYear();
      const m = curr.getUTCMonth();
      const d = curr.getUTCDate();

      const eth = gregorianToEthiopian(curr);

      const entry: HolidayIndexEntry = {
        row,
        gcYear: y,
        gcMonth: m,
        gcDay: d,
        ethYear: eth.year,
        ethMonth: eth.month,
        ethDay: eth.day,
      };

      const gcKey = `${y}-${m}`;
      let gcBucket = byGcMonth.get(gcKey);
      if (!gcBucket) {
        gcBucket = [];
        byGcMonth.set(gcKey, gcBucket);
      }
      gcBucket.push(entry);

      const ethKey = `${eth.year}-${eth.month}`;
      let ethBucket = byEthMonth.get(ethKey);
      if (!ethBucket) {
        ethBucket = [];
        byEthMonth.set(ethKey, ethBucket);
      }
      ethBucket.push(entry);

      curr.setTime(curr.getTime() + 86400000);
    }
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
  displayEndDay?: number;
  displayEndMonthName?: string;
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
  const processedIds = new Set<string>();

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

  const key = `${activeYear}-${activeMonth}`;
  const entries = isEth
    ? (index.byEthMonth.get(key) ?? [])
    : (index.byGcMonth.get(key) ?? []);

  for (const entry of entries) {
    const dayNum = isEth ? entry.ethDay : entry.gcDay;
    const existing = map.get(dayNum) ?? [];
    existing.push(entry.row);
    map.set(dayNum, existing);

    // Deduplicate in event list so multi-day events appear once as a range banner
    if (!processedIds.has(entry.row.id)) {
      processedIds.add(entry.row.id);

      if (entry.row.endDate && entry.row.endDate !== entry.row.date) {
        const startDate = new Date(`${entry.row.date}T12:00:00Z`);
        const endDate = new Date(`${entry.row.endDate}T12:00:00Z`);

        if (isEth) {
          const ethStart = gregorianToEthiopian(startDate);
          const ethEnd = gregorianToEthiopian(endDate);
          list.push({
            ...entry.row,
            displayDay: ethStart.day,
            displayMonthName: ethShorts[ethStart.month] ?? "",
            displayEndDay: ethEnd.day,
            displayEndMonthName: ethShorts[ethEnd.month] ?? "",
          });
        } else {
          list.push({
            ...entry.row,
            displayDay: startDate.getUTCDate(),
            displayMonthName: gcShorts[startDate.getUTCMonth()] ?? "",
            displayEndDay: endDate.getUTCDate(),
            displayEndMonthName: gcShorts[endDate.getUTCMonth()] ?? "",
          });
        }
      } else {
        const monthName = isEth
          ? ethShorts[entry.ethMonth] ?? ""
          : gcShorts[entry.gcMonth] ?? "";
        list.push({
          ...entry.row,
          displayDay: dayNum,
          displayMonthName: monthName,
        });
      }
    }
  }

  return { map, list };
}
