import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import type { HolidayRow } from "../types";
import {
  ETHIOPIAN_MONTH_NAMES_AM,
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
      const rows = await db.getAllAsync<HolidayRow>(
        "SELECT * FROM Holiday WHERE language = ? ORDER BY date",
        [language],
      );
      return rows.map((row) => ({
        ...row,
        type: row.type.toLowerCase() as HolidayRow["type"],
      }));
    },
  });
}

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type DisplayHoliday = HolidayRow & {
  displayDay: number;
  displayMonthName: string;
};

export function getHolidaysForActiveMonth(
  holidays: HolidayRow[] | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
): { map: Map<number, HolidayRow[]>; list: DisplayHoliday[] } {
  const map = new Map<number, HolidayRow[]>();
  const list: DisplayHoliday[] = [];

  if (!holidays) return { map, list };

  for (const h of holidays) {
    const [yStr, mStr, dStr] = h.date.split("-");
    const gcYear = parseInt(yStr, 10);
    const gcMonth = parseInt(mStr, 10) - 1;
    const gcDay = parseInt(dStr, 10);

    if (isEth) {
      // Convert Gregorian date from DB to Ethiopian date (using noon UTC to prevent timezone shifts)
      const eth = gregorianToEthiopian(new Date(`${h.date}T12:00:00Z`));
      if (eth.year === activeYear && eth.month === activeMonth) {
        const ethMonthName = ETHIOPIAN_MONTH_NAMES_AM[eth.month] ?? "";

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
        const gcMonthName = MONTH_NAMES_SHORT[gcMonth] ?? "Jan";

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
