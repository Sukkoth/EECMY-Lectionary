import {
  prepareDayInfo,
  prepareHolidays,
  prepareReadings,
  prepareSyncRecord,
} from "../lib/content/ContentUpdateService";

describe("ContentUpdateService", () => {
  describe("prepareDayInfo", () => {
    it("converts dayInfo package into insert statements", () => {
      const pkg = {
        version: 1,
        dayInfo: [
          { date: "2026-01-01", title: "New Year", description: "First day", seasonColor: "WHITE" },
        ],
      };
      const prepared = prepareDayInfo(pkg, "en");
      expect(prepared.statements.length).toBe(1);
      expect(prepared.statements[0].sql).toContain("INSERT OR REPLACE INTO DayInfo");
      expect(prepared.statements[0].params[1]).toBe("en");
      expect(prepared.statements[0].params[2]).toBe("2026-01-01");
      expect(prepared.statements[0].params[3]).toBe("New Year");
    });
  });

  describe("prepareHolidays", () => {
    it("converts holidays package into insert statements with index keys", () => {
      const pkg = {
        version: 1,
        holidays: [
          { date: "2026-01-07", type: "FEAST", name: "Genna Christmas", description: "Feast of Nativity" },
        ],
      };
      const prepared = prepareHolidays(pkg, "am");
      expect(prepared.statements.length).toBe(1);
      expect(prepared.statements[0].sql).toContain("INSERT OR REPLACE INTO Holiday");
      expect(prepared.statements[0].params[0]).toBe("holiday:am:2026-01-07:0");
      expect(prepared.statements[0].params[5]).toBe("Genna Christmas");
    });
  });

  describe("prepareReadings (Happy & Unhappy Paths)", () => {
    it("converts readings package into SQL insert statements", () => {
      const pkg = {
        version: 1,
        readings: [
          { date: "2026-01-01", order: 1, section: "GOSPEL", reference: "John 1:1", text: "In the beginning..." },
        ],
      };
      const prepared = prepareReadings(pkg, "en", "niv");
      expect(prepared.statements.length).toBe(1);
      expect(prepared.statements[0].sql).toContain("INSERT OR REPLACE INTO Reading");
      expect(prepared.statements[0].params[1]).toBe("en");
      expect(prepared.statements[0].params[2]).toBe("niv");
      expect(prepared.statements[0].params[6]).toBe("John 1:1");
    });

    it("unhappy path: throws when package is null or empty", () => {
      expect(() => prepareReadings(null as any, "en", "niv")).toThrow(/empty or invalid/);
      expect(() => prepareReadings({ version: 1, readings: [] }, "en", "niv")).toThrow(/empty or invalid/);
    });

    it("unhappy path: throws when CDN package version does not match manifest contentVersion", () => {
      const pkg = {
        version: 1, // Stale version 1 from CDN
        readings: [
          { date: "2026-01-01", order: 1, section: "GOSPEL", reference: "John 1:1", text: "In the beginning..." },
        ],
      };
      // Manifest requested version 2
      expect(() => prepareReadings(pkg, "en", "niv", 2)).toThrow(/Content version mismatch/);
    });

    it("unhappy path: throws when reading item is missing date", () => {
      const pkg = {
        version: 1,
        readings: [{ order: 1, reference: "John 1:1", text: "In the beginning" }],
      };
      expect(() => prepareReadings(pkg as any, "en", "niv")).toThrow(/missing date/);
    });

    it("unhappy path: throws when scripture reference is missing or whitespace", () => {
      const pkg = {
        version: 1,
        readings: [{ date: "2026-01-01", order: 1, reference: "   ", text: "In the beginning" }],
      };
      expect(() => prepareReadings(pkg as any, "en", "niv")).toThrow(/missing scripture reference/);
    });

    it("unhappy path: throws when scripture text is missing or whitespace", () => {
      const pkg = {
        version: 1,
        readings: [{ date: "2026-01-01", order: 1, reference: "John 1:1", text: "  " }],
      };
      expect(() => prepareReadings(pkg as any, "en", "niv")).toThrow(/missing scripture text/);
    });
  });

  describe("prepareSyncRecord", () => {
    it("creates a SyncRecord insert statement", () => {
      const stmt = prepareSyncRecord(2026, "en", "English", "niv", "NIV 2026", "readings", "checksum123", 1);
      expect(stmt.sql).toContain("INSERT OR REPLACE INTO SyncRecord");
      expect(stmt.params[1]).toBe("readings");
      expect(stmt.params[6]).toBe(2026);
    });
  });
});
