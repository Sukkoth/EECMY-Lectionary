import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import type { DayInfoRow } from "../types";
import { gregorianToEthiopian } from "../ethiopianCalendar";

export const DAY_INFO_KEYS = {
  all: ["dayinfo"] as const,
  language: (language: string) => ["dayinfo", language] as const,
};

export function useDayInfo(language: string) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: DAY_INFO_KEYS.language(language),
    queryFn: async (): Promise<DayInfoRow[]> => {
      let rows = await db.getAllAsync<DayInfoRow>(
        "SELECT * FROM DayInfo WHERE language = ? ORDER BY date",
        [language],
      );
      if (rows.length === 0 && language !== "am") {
        rows = await db.getAllAsync<DayInfoRow>(
          "SELECT * FROM DayInfo WHERE language = 'am' ORDER BY date",
        );
      }
      return rows;
    },
  });
}

export function getDayInfoForActiveMonth(
  dayInfoList: DayInfoRow[] | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
): Map<number, DayInfoRow> {
  const map = new Map<number, DayInfoRow>();
  if (!dayInfoList) return map;

  for (const info of dayInfoList) {
    if (isEth) {
      const eth = gregorianToEthiopian(new Date(`${info.date}T12:00:00Z`));
      if (eth.year === activeYear && eth.month === activeMonth) {
        map.set(eth.day, info);
      }
    } else {
      const [yStr, mStr, dStr] = info.date.split("-");
      const gcYear = parseInt(yStr, 10);
      const gcMonth = parseInt(mStr, 10) - 1;
      const gcDay = parseInt(dStr, 10);
      if (gcYear === activeYear && gcMonth === activeMonth) {
        map.set(gcDay, info);
      }
    }
  }

  return map;
}
