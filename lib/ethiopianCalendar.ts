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

export const ETHIOPIAN_MONTH_NAMES_SHORT_AM = [
  "መስ",
  "ጥቅ",
  "ኅዳ",
  "ታኅ",
  "ጥር",
  "የካ",
  "መጋ",
  "ሚያ",
  "ግን",
  "ሰኔ",
  "ሐም",
  "ነሐ",
  "ጳጉ",
] as const;

export const GREGORIAN_MONTH_NAMES_SHORT = [
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
  const validMonthIndex = Math.max(0, Math.min(12, monthIndex));
  const maxDays = getDaysInEthiopianMonth(ethYear, validMonthIndex);
  const validDay = Math.max(1, Math.min(maxDays, ethDay));

  // 1 Meskerem ethYear is Sept 11 (or Sept 12 if previous Ethiopian year (ethYear - 1) was a leap year with 6 Pagume days)
  const sepDay = (ethYear - 1) % 4 === 3 ? 12 : 11;
  const meskerem1 = new Date(Date.UTC(ethYear + 7, 8, sepDay, 12, 0, 0));
  const daysOffset = validMonthIndex * 30 + (validDay - 1);
  const gcDate = new Date(meskerem1.getTime() + daysOffset * 86400000);

  return {
    year: gcDate.getUTCFullYear(),
    month: gcDate.getUTCMonth(),
    day: gcDate.getUTCDate(),
  };
}

/** Convert Gregorian Date to Ethiopian date (0-indexed month: 0..12) */
export function gregorianToEthiopian(date: Date): { year: number; month: number; day: number } {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  const eth = EthDateTime.fromEuropeanDate(utcDate);
  return {
    year: eth.year,
    month: eth.month - 1,
    day: eth.date,
  };
}

/** Compute Evangelist of the Year (ባሕረ ሐሳብ) */
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

/** Calculate Ethiopian Calendar Week Number (1..53) for a given Ethiopian date (0-indexed month: 0..12) */
export function getEcWeekNumber(monthIndex: number, ethDay: number): number {
  const totalDays = monthIndex * 30 + (ethDay - 1);
  return Math.floor(totalDays / 7) + 1;
}

/** Generates week grid rows for Ethiopian month (0-indexed month: 0..12) */
export function getEthiopianWeeks(ethYear: number, monthIndex: number): (number | null)[][] {
  const validMonthIndex = Math.max(0, Math.min(12, monthIndex));
  const firstEth = new EthDateTime(ethYear, validMonthIndex + 1, 1);
  const firstDayOfWeek = firstEth.getDay();
  const daysInMonth = getDaysInEthiopianMonth(ethYear, validMonthIndex);

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

/** Generate the secondary calendar month span subtitle for header */
export function getSubMonthSpanString(year: number, month: number, isEth: boolean): string {
  if (isEth) {
    const daysInMonth = getDaysInEthiopianMonth(year, month);
    const firstGc = ethiopianToGregorian(year, month, 1);
    const lastGc = ethiopianToGregorian(year, month, daysInMonth);

    const m1 = GREGORIAN_MONTH_NAMES_SHORT[firstGc.month];
    const m2 = GREGORIAN_MONTH_NAMES_SHORT[lastGc.month];

    if (m1 === m2) {
      return `${m1} ${firstGc.day}–${lastGc.day}, ${lastGc.year}`;
    }
    return `${m1} ${firstGc.day} – ${m2} ${lastGc.day}, ${lastGc.year}`;
  }

  // GC Mode: find Ethiopian sub-months in this GC month
  const daysInGcMonth = new Date(year, month + 1, 0).getDate();
  const firstEth = gregorianToEthiopian(new Date(Date.UTC(year, month, 1, 12)));
  const lastEth = gregorianToEthiopian(new Date(Date.UTC(year, month, daysInGcMonth, 12)));

  // Check if Pagume (month index 12) falls inside this GC month (e.g. September 6..10)
  const pagumeEth = gregorianToEthiopian(new Date(Date.UTC(year, month, 7, 12)));
  const hasPagume = pagumeEth.month === 12;

  const e1 = ETHIOPIAN_MONTH_NAMES_AM[firstEth.month];
  const e2 = ETHIOPIAN_MONTH_NAMES_AM[lastEth.month];

  if (hasPagume) {
    return `${e1} ${firstEth.day} – ጳጉሜ – ${e2} ${lastEth.day}`;
  }
  if (firstEth.month === lastEth.month) {
    return `${e1} ${firstEth.day}–${lastEth.day}`;
  }
  return `${e1} ${firstEth.day} – ${e2} ${lastEth.day}`;
}
