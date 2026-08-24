import { formatTimeString } from "../lib/settings";

describe("settings helpers", () => {
  describe("formatTimeString", () => {
    it("happy path: formats 24h format correctly", () => {
      expect(formatTimeString("14:30", "24h")).toBe("14:30");
      expect(formatTimeString("07:05", "24h")).toBe("07:05");
    });

    it("happy path: formats 12h AM/PM format correctly", () => {
      expect(formatTimeString("14:30", "12h")).toBe("2:30 PM");
      expect(formatTimeString("07:05", "12h")).toBe("7:05 AM");
      expect(formatTimeString("00:00", "12h")).toBe("12:00 AM");
      expect(formatTimeString("12:00", "12h")).toBe("12:00 PM");
    });

    it("unhappy path: handles malformed, null, or garbage time strings gracefully", () => {
      expect(formatTimeString("invalid", "12h")).toBe("7:00 AM");
      expect(formatTimeString("abc:xyz", "12h")).toBe("7:00 AM");
      expect(formatTimeString("", "12h")).toBe("7:00 AM");
      expect(formatTimeString(null as any, "12h")).toBe("7:00 AM");
      expect(formatTimeString(undefined as any, "12h")).toBe("7:00 AM");
    });
  });
});
