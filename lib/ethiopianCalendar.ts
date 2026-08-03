import { EthDateTime } from "ethiopian-calendar-date-converter";

// Ethiopian Calendar Mode Month Names (0-indexed: 0..12)
export const ETHIOPIAN_MONTH_NAMES_EN = [
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

export const ETHIOPIAN_MONTH_NAMES = ETHIOPIAN_MONTH_NAMES_EN;

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
  "ጳጉሜን",
] as const;

export const ETHIOPIAN_MONTH_NAMES_OM = [
  "Fulbaana",
  "Onkoloolessa",
  "Sadaasa",
  "Mudde",
  "Amajjii",
  "Guraandhala",
  "Bitootessa",
  "Eebla",
  "Caamsaa",
  "Waxabajjii",
  "Adoolessa",
  "Hagayya",
  "Qaammee",
] as const;

// Gregorian Calendar Mode Month Names (0-indexed: 0..11)
export const GREGORIAN_MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const GREGORIAN_MONTH_NAMES_AM = [
  "ጃንዋሪ",
  "ፌብሩዋሪ",
  "ማርች",
  "ኤፕሪል",
  "ሜይ",
  "ጁን",
  "ጁላይ",
  "ኦገስት",
  "ሴፕቴምበር",
  "ኦክቶበር",
  "ኖቬምበር",
  "ዲሴምበር",
] as const;

export const GREGORIAN_MONTH_NAMES_OM = [
  "Jaanwaarii",
  "Feebruwarii",
  "Maarch",
  "Eepril",
  "Meeyi",
  "Juun",
  "Juulaayi",
  "Oogest",
  "Seepteember",
  "Oktoober",
  "Noovember",
  "Dissember",
] as const;

// Short versions for grid cells
export const ETHIOPIAN_MONTH_NAMES_SHORT_AM = [
  "መስ", "ጥቅ", "ኅዳ", "ታኅ", "ጥር", "የካ", "መጋ", "ሚያ", "ግን", "ሰኔ", "ሐም", "ነሐ", "ጳጉ",
] as const;

export const ETHIOPIAN_MONTH_NAMES_SHORT_OM = [
  "Fulb", "Onko", "Sada", "Mudd", "Amaj", "Gura", "Bito", "Eebl", "Caam", "Waxa", "Adoo", "Haga", "Qaam",
] as const;

export const ETHIOPIAN_MONTH_NAMES_SHORT_EN = [
  "Mes", "Tik", "Hid", "Tah", "Tir", "Yek", "Meg", "Mia", "Gin", "Sen", "Ham", "Neh", "Pag",
] as const;

export const GREGORIAN_MONTH_NAMES_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const GREGORIAN_MONTH_NAMES_SHORT_AM = [
  "ጃን", "ፌብ", "ማር", "ኤፕ", "ሜይ", "ጁን", "ጁላይ", "ኦገ", "ሴፕ", "ኦክ", "ኖቬ", "ዲሴ",
] as const;

export const GREGORIAN_MONTH_NAMES_SHORT_OM = [
  "Jaan", "Feeb", "Maar", "Eep", "Mee", "Juun", "Juul", "Oog", "Seep", "Okto", "Noov", "Diss",
] as const;

export const GREGORIAN_MONTH_NAMES_SHORT = GREGORIAN_MONTH_NAMES_SHORT_EN;

/** Formats month name according to active calendar system and language */
export function formatMonth(month: number, isEth: boolean, lang: string = "am"): string {
  if (isEth) {
    const validEthMonth = Math.max(0, Math.min(12, month));
    if (lang === "om") return ETHIOPIAN_MONTH_NAMES_OM[validEthMonth] ?? "";
    if (lang === "en") return ETHIOPIAN_MONTH_NAMES_EN[validEthMonth] ?? "";
    return ETHIOPIAN_MONTH_NAMES_AM[validEthMonth] ?? "";
  }
  const validGcMonth = Math.max(0, Math.min(11, month));
  if (lang === "om") return GREGORIAN_MONTH_NAMES_OM[validGcMonth] ?? "";
  if (lang === "am") return GREGORIAN_MONTH_NAMES_AM[validGcMonth] ?? "";
  return GREGORIAN_MONTH_NAMES_EN[validGcMonth] ?? "";
}

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
export function getEvangelistYear(ethYear: number): { name: string; nameAmharic: string; nameOromoo: string } {
  const ameteAlem = ethYear + 5500;
  const remainder = ameteAlem % 4;
  switch (remainder) {
    case 1:
      return { name: "Matthew", nameAmharic: "ማቴዎስ", nameOromoo: "Maatewos" };
    case 2:
      return { name: "Mark", nameAmharic: "ማርቆስ", nameOromoo: "Maarqos" };
    case 3:
      return { name: "Luke", nameAmharic: "ሉቃስ", nameOromoo: "Luqaas" };
    case 0:
    default:
      return { name: "John", nameAmharic: "ዮሐንስ", nameOromoo: "Yohaannis" };
  }
}

/** Formats the Evangelist year badge text according to app language */
export function formatEvangelistYear(ethYear: number, lang: string = "am"): string {
  const ev = getEvangelistYear(ethYear);
  if (lang === "om") return `Bara ${ev.nameOromoo}`;
  if (lang === "en") return `Year of ${ev.name}`;
  return `ዘመነ ${ev.nameAmharic}`;
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

export const WEEKDAY_NAMES_AM = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"] as const;
export const WEEKDAY_NAMES_OM = ["Dilbata", "Wiixata", "Qibxata", "Roobii", "Kamiisa", "Jimaata", "Sanbata"] as const;

/** Formats a Date object into a readable date string according to the selected calendar style */
export function formatDisplayDate(
  date: Date,
  calendarStyle: "gregorian" | "ethiopian" = "gregorian",
  lang: string = "am",
): { weekday: string; dateString: string; fullString: string } {
  const dayOfWeekIndex = date.getDay();
  const weekday =
    lang === "om"
      ? WEEKDAY_NAMES_OM[dayOfWeekIndex]
      : lang === "am"
      ? WEEKDAY_NAMES_AM[dayOfWeekIndex]
      : date.toLocaleDateString("en-US", { weekday: "long" });

  if (calendarStyle === "ethiopian") {
    const eth = gregorianToEthiopian(date);
    const monthName = formatMonth(eth.month, true, lang);
    const dateString = `${monthName} ${eth.day}, ${eth.year}`;
    const fullString = `${weekday}, ${monthName} ${eth.day}, ${eth.year}`;

    return { weekday, dateString, fullString };
  }

  const monthName = formatMonth(date.getMonth(), false, lang);
  const dateString = `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  const fullString = `${weekday}, ${dateString}`;

  return { weekday, dateString, fullString };
}

/** Generate the secondary calendar month span subtitle for header */
export function getSubMonthSpanString(year: number, month: number, isEth: boolean, lang: string = "am"): string {
  if (isEth) {
    const daysInMonth = getDaysInEthiopianMonth(year, month);
    const firstGc = ethiopianToGregorian(year, month, 1);
    const lastGc = ethiopianToGregorian(year, month, daysInMonth);

    const gcShorts = lang === "om" ? GREGORIAN_MONTH_NAMES_SHORT_OM : lang === "am" ? GREGORIAN_MONTH_NAMES_SHORT_AM : GREGORIAN_MONTH_NAMES_SHORT_EN;
    const m1 = gcShorts[firstGc.month];
    const m2 = gcShorts[lastGc.month];

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

  const ethShorts = lang === "om" ? ETHIOPIAN_MONTH_NAMES_OM : lang === "en" ? ETHIOPIAN_MONTH_NAMES_EN : ETHIOPIAN_MONTH_NAMES_AM;
  const e1 = ethShorts[firstEth.month];
  const e2 = ethShorts[lastEth.month];
  const pagumeLabel = lang === "om" ? "Qaammee" : lang === "en" ? "Pagume" : "ጳጉሜን";

  if (hasPagume) {
    return `${e1} ${firstEth.day} – ${pagumeLabel} – ${e2} ${lastEth.day}`;
  }
  if (firstEth.month === lastEth.month) {
    return `${e1} ${firstEth.day}–${lastEth.day}`;
  }
  return `${e1} ${firstEth.day} – ${e2} ${lastEth.day}`;
}
