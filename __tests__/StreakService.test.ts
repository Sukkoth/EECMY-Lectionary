import { getWeekStart } from "../lib/StreakService";
import { toDateString } from "../lib/database";

describe("StreakService & Date Helpers", () => {
  describe("getWeekStart", () => {
    it("returns Sunday of the current week", () => {
      // Wednesday Aug 12, 2026 -> Sunday Aug 9, 2026
      const wednesday = new Date(2026, 7, 12);
      const weekStart = getWeekStart(wednesday);
      expect(weekStart).toBe("2026-08-09");
    });

    it("returns same day if input is Sunday", () => {
      // Sunday Aug 9, 2026
      const sunday = new Date(2026, 7, 9);
      expect(getWeekStart(sunday)).toBe("2026-08-09");
    });
  });

  describe("toDateString", () => {
    it("formats Date to YYYY-MM-DD string", () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(toDateString(date)).toBe("2026-01-05");
    });
  });
});
