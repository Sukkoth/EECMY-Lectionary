import { EthDateTime } from "ethiopian-calendar-date-converter";

export const ETHIOPIAN_MONTH_NAMES = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
] as const;

export const ETHIOPIAN_MONTH_NAMES_AM = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
] as const;

/** Get the number of days in an Ethiopian month (0-indexed month: 0..12) */
export function getDaysInEthiopianMonth(ethYear: number, monthIndex: number): number {
  if (monthIndex < 0 || monthIndex > 12) return 30;
  if (monthIndex < 12) return 30;
  // Pagume (month 12): 6 days in leap years, 5 days in normal years
  // Ethiopian leap year rule: (ethYear % 4 === 3)
  return ethYear % 4 === 3 ? 6 : 5;
}

/** Convert Ethiopian date (0-indexed month: 0..12) to Gregorian Date object */
export function ethiopianToGregorian(
  ethYear: number,
  monthIndex: number,
  ethDay: number,
): { year: number; month: number; day: number } {
  try {
    const validMonthIndex = Math.max(0, Math.min(12, monthIndex));
    const maxDays = getDaysInEthiopianMonth(ethYear, validMonthIndex);
    const validDay = Math.max(1, Math.min(maxDays, ethDay));

    // EthDateTime uses 1-indexed month (1..13)
    const eth = new EthDateTime(ethYear, validMonthIndex + 1, validDay);
    const gc = eth.toEuropeanDate();
    return {
      year: gc.getFullYear(),
      month: gc.getMonth(),
      day: gc.getDate(),
    };
  } catch {
    return {
      year: ethYear,
      month: Math.max(0, Math.min(11, monthIndex)),
      day: Math.max(1, Math.min(28, ethDay)),
    };
  }
}

/** Convert Gregorian Date to Ethiopian date (0-indexed month: 0..12) */
export function gregorianToEthiopian(date: Date): { year: number; month: number; day: number } {
  const eth = EthDateTime.fromEuropeanDate(date);
  return {
    year: eth.year,
    month: eth.month - 1,
    day: eth.date,
  };
}

/** Compute Evangelist of the Year */
export function getEvangelistYear(ethYear: number): { name: string; nameAmharic: string } {
  const ameteAlem = ethYear + 5500;
  const remainder = ameteAlem % 4;
  switch (remainder) {
    case 1:
      return { name: "Matthew", nameAmharic: "ማቴዎስ" };
    case 2:
      return { name: "Mark", nameAmharic: "ማርቆስ" };
    case 3:
      return { name: "Luke", nameAmharic: "ሉቃስ" };
    case 0:
    default:
      return { name: "John", nameAmharic: "ዮሐንስ" };
  }
}

/** Generates week grid rows for Ethiopian month (0-indexed month: 0..12) */
export function getEthiopianWeeks(ethYear: number, monthIndex: number): (number | null)[][] {
  // Find weekday of first day of Ethiopian month
  const firstGc = ethiopianToGregorian(ethYear, monthIndex, 1);
  const firstDayOfWeek = new Date(firstGc.year, firstGc.month, firstGc.day).getDay();
  const daysInMonth = getDaysInEthiopianMonth(ethYear, monthIndex);

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDayOfWeek).fill(null);

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

/** Formats a date object according to the selected calendar style */
export function formatDisplayDate(
  date: Date,
  calendarStyle: "gregorian" | "ethiopian" = "gregorian",
): { weekday: string; dateString: string; fullString: string } {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

  if (calendarStyle === "ethiopian") {
    const eth = gregorianToEthiopian(date);
    const ethMonthNameAm = ETHIOPIAN_MONTH_NAMES_AM[eth.month] ?? "";
    const dateString = `${ethMonthNameAm} ${eth.day}, ${eth.year}`;
    const fullString = `${weekday}, ${ethMonthNameAm} ${eth.day}, ${eth.year}`;

    return { weekday, dateString, fullString };
  }

  const dateString = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const fullString = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return { weekday, dateString, fullString };
}
