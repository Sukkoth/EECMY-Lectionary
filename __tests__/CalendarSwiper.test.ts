import {
  getOffsetMonth,
  getMonthDifference,
} from "@/components/calendar/CalendarSwiper";

describe("CalendarSwiper helpers", () => {
  describe("getOffsetMonth", () => {
    describe("Ethiopian Calendar (13 months)", () => {
      it("increments month within the same year", () => {
        const result = getOffsetMonth({ year: 2018, month: 0 }, 1, true);
        expect(result).toEqual({ year: 2018, month: 1 });
      });

      it("rolls over to the next year after Pagume (month 12 -> month 0)", () => {
        const result = getOffsetMonth({ year: 2018, month: 12 }, 1, true);
        expect(result).toEqual({ year: 2019, month: 0 });
      });

      it("rolls back to Pagume of previous year when going back from Meskerem (month 0 -> month 12)", () => {
        const result = getOffsetMonth({ year: 2018, month: 0 }, -1, true);
        expect(result).toEqual({ year: 2017, month: 12 });
      });
    });

    describe("Gregorian Calendar (12 months)", () => {
      it("increments month within the same year", () => {
        const result = getOffsetMonth({ year: 2026, month: 5 }, 1, false);
        expect(result).toEqual({ year: 2026, month: 6 });
      });

      it("rolls over to next year after December (month 11 -> month 0)", () => {
        const result = getOffsetMonth({ year: 2026, month: 11 }, 1, false);
        expect(result).toEqual({ year: 2027, month: 0 });
      });

      it("rolls back to December of previous year when going back from January (month 0 -> month 11)", () => {
        const result = getOffsetMonth({ year: 2026, month: 0 }, -1, false);
        expect(result).toEqual({ year: 2025, month: 11 });
      });
    });
  });

  describe("getMonthDifference", () => {
    it("computes exact month difference for Ethiopian calendar", () => {
      const base = { year: 2018, month: 0 };
      const nextMonth = { year: 2018, month: 1 };
      const nextYear = { year: 2019, month: 0 };
      const prevYearPagume = { year: 2017, month: 12 };

      expect(getMonthDifference(base, nextMonth, true)).toBe(1);
      expect(getMonthDifference(base, nextYear, true)).toBe(13);
      expect(getMonthDifference(base, prevYearPagume, true)).toBe(-1);
    });

    it("computes exact month difference for Gregorian calendar", () => {
      const base = { year: 2026, month: 0 };
      const nextMonth = { year: 2026, month: 1 };
      const nextYear = { year: 2027, month: 0 };
      const prevYearDec = { year: 2025, month: 11 };

      expect(getMonthDifference(base, nextMonth, false)).toBe(1);
      expect(getMonthDifference(base, nextYear, false)).toBe(12);
      expect(getMonthDifference(base, prevYearDec, false)).toBe(-1);
    });

    it("is an exact inverse of getOffsetMonth", () => {
      const base = { year: 2019, month: 4 };
      for (let offset = -20; offset <= 20; offset++) {
        const targetEth = getOffsetMonth(base, offset, true);
        expect(getMonthDifference(base, targetEth, true)).toBe(offset);

        const targetGc = getOffsetMonth(base, offset, false);
        expect(getMonthDifference(base, targetGc, false)).toBe(offset);
      }
    });
  });
});
