import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import type { DayInfoRow } from "../types";
import { gregorianToEthiopian } from "../ethiopianCalendar";

const DAY_INFO_KEYS = {
  all: ["dayinfo"] as const,
  language: (language: string, readingLanguage?: string) =>
    ["dayinfo", language, readingLanguage ?? ""] as const,
};

export type DayInfoIndex = {
  /** Key: "YYYY-M" (GC, 0-indexed month) → day → DayInfoRow */
  byGcMonth: Map<string, Map<number, DayInfoRow>>;
  /** Key: "YYYY-M" (ETH, 0-indexed month) → day → DayInfoRow */
  byEthMonth: Map<string, Map<number, DayInfoRow>>;
};

function buildDayInfoIndex(rows: DayInfoRow[]): DayInfoIndex {
  const byGcMonth = new Map<string, Map<number, DayInfoRow>>();
  const byEthMonth = new Map<string, Map<number, DayInfoRow>>();

  for (const info of rows) {
    const [yStr, mStr, dStr] = info.date.split("-");
    const gcYear = parseInt(yStr, 10);
    const gcMonth = parseInt(mStr, 10) - 1; // 0-indexed
    const gcDay = parseInt(dStr, 10);

    // Gregorian bucket
    const gcKey = `${gcYear}-${gcMonth}`;
    let gcBucket = byGcMonth.get(gcKey);
    if (!gcBucket) { gcBucket = new Map(); byGcMonth.set(gcKey, gcBucket); }
    gcBucket.set(gcDay, info);

    // Ethiopian bucket — convert once using noon UTC to prevent timezone drift
    const eth = gregorianToEthiopian(new Date(`${info.date}T12:00:00Z`));
    const ethKey = `${eth.year}-${eth.month}`;
    let ethBucket = byEthMonth.get(ethKey);
    if (!ethBucket) { ethBucket = new Map(); byEthMonth.set(ethKey, ethBucket); }
    ethBucket.set(eth.day, info);
  }

  return { byGcMonth, byEthMonth };
}

export function useDayInfo(language: string, readingLanguage?: string) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: DAY_INFO_KEYS.language(language, readingLanguage),
    queryFn: async (): Promise<DayInfoRow[]> => {
      // 3-tier cascade: 1. UI Language, 2. Reading Language, 3. Amharic (stops at 3)
      const candidates = Array.from(
        new Set([language, readingLanguage, "am"].filter(Boolean) as string[]),
      );

      for (const cand of candidates) {
        const rows = await db.getAllAsync<DayInfoRow>(
          "SELECT * FROM DayInfo WHERE language = ? ORDER BY date",
          [cand],
        );
        if (rows.length > 0) {
          return rows;
        }
      }
      return [];
    },
    // Build the index once when query data settles — O(n) only on load/language change
    select: buildDayInfoIndex,
  });
}

export function getDayInfoForActiveMonth(
  index: DayInfoIndex | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
): Map<number, DayInfoRow> {
  if (!index) return new Map();

  // O(1) lookup — returns the pre-built day→DayInfoRow map for this month
  const key = `${activeYear}-${activeMonth}`;
  return (isEth ? index.byEthMonth.get(key) : index.byGcMonth.get(key)) ?? new Map();
}
