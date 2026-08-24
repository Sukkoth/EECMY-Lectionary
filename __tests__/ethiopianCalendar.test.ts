import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  getDaysInEthiopianMonth,
  formatEvangelistYear,
  formatDisplayDate,
} from "../lib/ethiopianCalendar";

describe("ethiopianCalendar", () => {
  describe("gregorianToEthiopian & ethiopianToGregorian", () => {
    it("converts Gregorian date to Ethiopian date correctly (0-indexed month)", () => {
      // Jan 7, 2026 GC -> Tahsas 29, 2018 EC (Tahsas is monthIndex 3)
      const gcDate = new Date(2026, 0, 7);
      const ec = gregorianToEthiopian(gcDate);
      expect(ec.year).toBe(2018);
      expect(ec.month).toBe(3); // 0-indexed Tahsas
      expect(ec.day).toBe(29);
    });

    it("handles Pagume leap year calculation (0-indexed month index 12)", () => {
      // 2015 EC is a leap year (Pagume has 6 days)
      expect(getDaysInEthiopianMonth(2015, 12)).toBe(6);
      // 2016 EC is a normal year (Pagume has 5 days)
      expect(getDaysInEthiopianMonth(2016, 12)).toBe(5);
    });

    it("unhappy path: handles out-of-bound month indices safely", () => {
      // Out of bounds month indices (-5, 99) fall back to 30 days
      expect(getDaysInEthiopianMonth(2026, -5)).toBe(30);
      expect(getDaysInEthiopianMonth(2026, 99)).toBe(30);
    });

    it("converts Ethiopian date back to Gregorian date components", () => {
      const gcOriginal = new Date(2026, 8, 11); // Sept 11, 2026 (New Year 2019 EC)
      const ec = gregorianToEthiopian(gcOriginal);
      const gcConverted = ethiopianToGregorian(ec.year, ec.month, ec.day);
      expect(gcConverted.year).toBe(gcOriginal.getFullYear());
      expect(gcConverted.month).toBe(gcOriginal.getMonth());
      expect(gcConverted.day).toBe(gcOriginal.getDate());
    });
  });

  describe("Evangelist Years", () => {
    it("formats Evangelist year strings", () => {
      expect(formatEvangelistYear(2017, "en")).toBe("Year of Matthew");
      expect(formatEvangelistYear(2017, "am")).toBe("ዘመነ ማቴዎስ");
      expect(formatEvangelistYear(2017, "om")).toBe("Bara Maatewos");
    });
  });

  describe("formatDisplayDate", () => {
    it("formats Gregorian display dates", () => {
      const date = new Date(2026, 0, 15);
      const formatted = formatDisplayDate(date, "gregorian", "en");
      expect(formatted.fullString).toContain("January");
      expect(formatted.fullString).toContain("2026");
    });
  });
});
