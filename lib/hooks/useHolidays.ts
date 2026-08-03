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
  });
}

export type DisplayHoliday = HolidayRow & {
  displayDay: number;
  displayMonthName: string;
};

export function getHolidaysForActiveMonth(
  holidays: HolidayRow[] | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
  lang: string = "am",
): { map: Map<number, HolidayRow[]>; list: DisplayHoliday[] } {
  const map = new Map<number, HolidayRow[]>();
  const list: DisplayHoliday[] = [];

  if (!holidays) return { map, list };

  const ethShorts = lang === "om" ? ETHIOPIAN_MONTH_NAMES_SHORT_OM : lang === "en" ? ETHIOPIAN_MONTH_NAMES_SHORT_EN : ETHIOPIAN_MONTH_NAMES_SHORT_AM;
  const gcShorts = lang === "om" ? GREGORIAN_MONTH_NAMES_SHORT_OM : lang === "am" ? GREGORIAN_MONTH_NAMES_SHORT_AM : GREGORIAN_MONTH_NAMES_SHORT_EN;

  for (const h of holidays) {
    const [yStr, mStr, dStr] = h.date.split("-");
    const gcYear = parseInt(yStr, 10);
    const gcMonth = parseInt(mStr, 10) - 1;
    const gcDay = parseInt(dStr, 10);

    if (isEth) {
      // Convert Gregorian date from DB to Ethiopian date (using noon UTC to prevent timezone shifts)
      const eth = gregorianToEthiopian(new Date(`${h.date}T12:00:00Z`));
      if (eth.year === activeYear && eth.month === activeMonth) {
        const ethMonthName = ethShorts[eth.month] ?? "";

        const existing = map.get(eth.day) ?? [];
        existing.push(h);
        map.set(eth.day, existing);

        list.push({
          ...h,
          displayDay: eth.day,
          displayMonthName: ethMonthName,
        });
      }
    } else {
      if (gcYear === activeYear && gcMonth === activeMonth) {
        const gcMonthName = gcShorts[gcMonth] ?? "";

        const existing = map.get(gcDay) ?? [];
        existing.push(h);
        map.set(gcDay, existing);

        list.push({
          ...h,
          displayDay: gcDay,
          displayMonthName: gcMonthName,
        });
      }
    }
  }

  return { map, list };
}
