import {
  getSyncedYears,
  getSyncedReadingCounts,
  isContentDownloaded,
} from "../lib/content/ContentUpdateRepository";

describe("ContentUpdateRepository", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };
  });

  describe("getSyncedYears", () => {
    it("returns array of distinct synced years from SQLite", async () => {
      mockDb.getAllAsync.mockResolvedValue([{ year: 2026 }, { year: 2025 }]);
      const years = await getSyncedYears(mockDb);
      expect(years).toEqual([2026, 2025]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT year FROM SyncRecord")
      );
    });
  });

  describe("getSyncedReadingCounts", () => {
    it("returns synced reading count per year", async () => {
      mockDb.getAllAsync.mockResolvedValue([{ year: 2026, syncedCount: 365 }]);
      const counts = await getSyncedReadingCounts(mockDb);
      expect(counts).toEqual([{ year: 2026, syncedCount: 365 }]);
    });
  });

  describe("isContentDownloaded", () => {
    it("returns true when count > 0", async () => {
      mockDb.getFirstAsync.mockResolvedValue({ cnt: 1 });
      const downloaded = await isContentDownloaded(mockDb, 2026, "en", "readings");
      expect(downloaded).toBe(true);
    });

    it("returns false when count is 0 or null", async () => {
      mockDb.getFirstAsync.mockResolvedValue({ cnt: 0 });
      const downloaded = await isContentDownloaded(mockDb, 2026, "en", "readings");
      expect(downloaded).toBe(false);
    });
  });
});
