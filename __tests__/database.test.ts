import { ReadingsDB } from "../lib/database";

describe("ReadingsDB", () => {
  let mockDb: any;
  let readingsDB: ReadingsDB;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
    };
    readingsDB = new ReadingsDB(mockDb);
  });

  describe("getReadingsForDateRange", () => {
    it("executes correct SQL query and groups readings by date", async () => {
      mockDb.getAllAsync.mockResolvedValue([
        {
          date: "2026-01-01",
          order: 1,
          section: "OLD_TESTAMENT",
          reference: "Genesis 1:1",
          text: "In the beginning",
          version: "niv",
          title: "New Year",
          description: "Lectionary Day 1",
          seasonColor: "WHITE",
        },
        {
          date: "2026-01-01",
          order: 2,
          section: "GOSPEL",
          reference: "John 1:1",
          text: "In the beginning was the Word",
          version: "niv",
          title: "New Year",
          description: "Lectionary Day 1",
          seasonColor: "WHITE",
        },
      ]);

      const date = new Date(2026, 0, 1);
      const results = await readingsDB.getReadingsForDateRange(date, date, "en", "niv");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("SELECT r.date, r.\"order\""),
        ["en", "niv", "2026-01-01", "2026-01-01"]
      );

      expect(results.length).toBe(1);
      expect(results[0].dayInfo?.title).toBe("New Year");
      expect(results[0].readings.length).toBe(2);
      expect(results[0].readings[0].section).toBe("OLD_TESTAMENT");
      expect(results[0].readings[1].section).toBe("GOSPEL");
    });

    it("returns empty array when no readings exist for the date range", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const date = new Date(2026, 0, 1);
      const results = await readingsDB.getReadingsForDateRange(date, date, "en", "niv");

      expect(results).toEqual([]);
    });
  });

  describe("getReadingsForDate", () => {
    it("returns single DayData object for a specific date", async () => {
      mockDb.getAllAsync.mockResolvedValue([
        {
          date: "2026-01-01",
          order: 1,
          section: "GOSPEL",
          reference: "John 1:1",
          text: "In the beginning",
          version: "niv",
          title: null,
          description: null,
          seasonColor: null,
        },
      ]);

      const date = new Date(2026, 0, 1);
      const result = await readingsDB.getReadingsForDate(date, "en", "niv");

      expect(result).not.toBeNull();
      expect(result?.readings[0].reference).toBe("John 1:1");
      expect(result?.dayInfo).toBeNull();
    });

    it("returns null when no readings are found for the date", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const date = new Date(2026, 0, 1);
      const result = await readingsDB.getReadingsForDate(date, "en", "niv");

      expect(result).toBeNull();
    });
  });
});
