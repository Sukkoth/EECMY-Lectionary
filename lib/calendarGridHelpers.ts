import type { HolidayRow, DayInfoRow } from "@/lib/types";
import {
  getEthiopianWeeks,
  ethiopianToGregorian,
  gregorianToEthiopian,
  gregorianYmdToEthiopian,
  ETHIOPIAN_MONTH_NAMES_SHORT_AM,
  ETHIOPIAN_MONTH_NAMES_SHORT_OM,
  ETHIOPIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_EN,
  GREGORIAN_MONTH_NAMES_SHORT_AM,
  GREGORIAN_MONTH_NAMES_SHORT_OM,
} from "./ethiopianCalendar";

export type GridCell =
  | { isNull: true; key: string }
  | {
      isNull: false;
      key: string;
      day: number;
      targetGc: { year: number; month: number; day: number };
      subLabel: string;
      showSubMonthLabel: boolean;
      today: boolean;
      types: string[];
      seasonColor?: string;
      seasonStyle?: any;
      isSunday: boolean;
    };

/**
 * Returns month short name dictionaries for Gregorian and Ethiopian calendars based on active language.
 */
export function getMonthShortNames(lang: string) {
  const gcShorts =
    lang === "om"
      ? GREGORIAN_MONTH_NAMES_SHORT_OM
      : lang === "am"
        ? GREGORIAN_MONTH_NAMES_SHORT_AM
        : GREGORIAN_MONTH_NAMES_SHORT_EN;
  const ethShorts =
    lang === "om"
      ? ETHIOPIAN_MONTH_NAMES_SHORT_OM
      : lang === "en"
        ? ETHIOPIAN_MONTH_NAMES_SHORT_EN
        : ETHIOPIAN_MONTH_NAMES_SHORT_AM;

  return { gcShorts, ethShorts };
}

/**
 * Computes 2D grid matrix of Gregorian weeks (0-indexed month).
 */
export function getGregorianWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

/**
 * Formats border outline style for liturgical season colors.
 */
function getSeasonContainerStyle(
  seasonColor?: string,
  today = false,
  showSeasonColors = true,
) {
  if (today || !showSeasonColors || !seasonColor) return undefined;
  const sc = seasonColor.trim();
  if (sc.startsWith("#") && sc.length === 7) {
    return {
      borderColor: `${sc}60`,
      borderWidth: 1,
      backgroundColor: "transparent",
    };
  }
  return {
    borderColor: sc,
    borderWidth: 1,
    backgroundColor: "transparent",
  };
}

/**
 * Batch-processes date math, sub-labels, and season color styles in a single pass.
 * Ensures zero object allocations or date math during active UI rendering.
 */
export function buildMonthGridMatrix(params: {
  weeks: (number | null)[][];
  year: number;
  month: number;
  isEth: boolean;
  ethToday: { year: number; month: number; day: number };
  gcToday: { year: number; month: number; day: number };
  gcShorts: readonly string[];
  ethShorts: readonly string[];
  holidays: Map<number, HolidayRow[]>;
  dayInfoMap?: Map<number, DayInfoRow>;
  showSeasonColors: boolean;
}): GridCell[][] {
  const {
    weeks,
    year,
    month,
    isEth,
    ethToday,
    gcToday,
    gcShorts,
    ethShorts,
    holidays,
    dayInfoMap,
    showSeasonColors,
  } = params;

  return weeks.map((week, wi) => {
    return week.map((day, di) => {
      if (day === null) {
        return { isNull: true, key: `empty-${wi}-${di}` };
      }

      let targetGc = { year, month, day };
      let subDay = 0;
      let subMonthIndex = 0;
      let today = false;

      if (isEth) {
        targetGc = ethiopianToGregorian(year, month, day);
        subDay = targetGc.day;
        subMonthIndex = targetGc.month;
        today =
          ethToday.year === year &&
          ethToday.month === month &&
          ethToday.day === day;
      } else {
        const eth = gregorianYmdToEthiopian(year, month, day);
        subDay = eth.day;
        subMonthIndex = eth.month;
        today =
          gcToday.year === year &&
          gcToday.month === month &&
          gcToday.day === day;
      }

      const showSubMonthLabel = subDay === 1 || day === 1;
      const subAbbr = isEth ? gcShorts[subMonthIndex] : ethShorts[subMonthIndex];
      const subLabel = showSubMonthLabel ? `${subAbbr} ${subDay}` : `${subDay}`;

      const dayHolidays = holidays.get(day) ?? [];
      const types: string[] = [];
      for (const h of dayHolidays) {
        if (!types.includes(h.type)) types.push(h.type);
      }

      const dayInfo = dayInfoMap?.get(day);
      const seasonColor = dayInfo?.seasonColor?.trim();
      const isSunday = di === 0;

      const seasonStyle = getSeasonContainerStyle(seasonColor, today, showSeasonColors);

      return {
        isNull: false,
        key: `day-${year}-${month}-${day}`,
        day,
        targetGc,
        subLabel,
        showSubMonthLabel,
        today,
        types,
        seasonColor,
        seasonStyle,
        isSunday,
      };
    });
  });
}
