import { getOffsetMonth } from "@/components/calendar/CalendarSwiper";

describe("CalendarSwiper getOffsetMonth helper", () => {
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
