import {
  getAllTags,
  createTag,
  deleteTag,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../lib/EventRepository";

describe("EventRepository", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      withTransactionAsync: jest.fn(async (callback: () => Promise<any>) => callback()),
    };
  });

  describe("Tag Operations", () => {
    it("fetches all tags ordered by createdAt ASC", async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: "tag_1", name: "Choir", color: "#8b5cf6", createdAt: "2026-01-01T00:00:00.000Z" },
        { id: "tag_2", name: "Youth", color: "#ec4899", createdAt: "2026-01-02T00:00:00.000Z" },
      ]);

      const tags = await getAllTags(mockDb);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, color, createdAt FROM Tag ORDER BY createdAt ASC"),
      );
      expect(tags).toHaveLength(2);
      expect(tags[0].name).toBe("Choir");
    });

    it("creates a new tag with provided or generated id", async () => {
      mockDb.runAsync.mockResolvedValue({});

      const newTag = await createTag(mockDb, {
        id: "tag_custom_1",
        name: "Bible Study",
        color: "#6366f1",
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Tag (id, name, color, createdAt) VALUES (?, ?, ?, ?)"),
        ["tag_custom_1", "Bible Study", "#6366f1", expect.any(String)],
      );
      expect(newTag.name).toBe("Bible Study");
      expect(newTag.color).toBe("#6366f1");
    });

    it("deletes a tag by id", async () => {
      mockDb.runAsync.mockResolvedValue({});

      await deleteTag(mockDb, "tag_custom_1");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM Tag WHERE id = ?"),
        ["tag_custom_1"],
      );
    });
  });

  describe("Event Operations", () => {
    it("fetches all events and hydrates with tags and alerts", async () => {
      mockDb.getAllAsync
        .mockResolvedValueOnce([
          {
            id: "evt_1",
            title: "Sunday Service",
            date: "2026-09-11",
            reminderTime: "07:00",
            notes: "Bring hymnal",
            tagId: "tag_1",
            tagName: "Choir",
            tagColor: "#8b5cf6",
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "alt_1",
            eventId: "evt_1",
            offset: "at_time",
            notificationId: null,
          },
          {
            id: "alt_2",
            eventId: "evt_1",
            offset: "30_min",
            notificationId: null,
          },
        ]);

      const events = await getAllEvents(mockDb);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe("Sunday Service");
      expect(events[0].tagName).toBe("Choir");
      expect(events[0].reminderOffsets).toEqual(["at_time", "30_min"]);
      expect(events[0].hasReminder).toBe(true);
    });

    it("creates an event with alerts in a transaction", async () => {
      mockDb.runAsync.mockResolvedValue({});

      const created = await createEvent(mockDb, {
        id: "evt_new",
        title: "Prayer Meeting",
        date: "2026-09-15",
        reminderTime: "18:00",
        notes: "Zoom link sent",
        tagId: "tag_1",
        reminderOffsets: ["at_time", "1_hour"],
      });

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Event"),
        expect.arrayContaining(["evt_new", "Prayer Meeting", "2026-09-15", "18:00"]),
      );
      expect(created.title).toBe("Prayer Meeting");
      expect(created.hasReminder).toBe(true);
    });

    it("updates an event and replaces its alerts", async () => {
      mockDb.runAsync.mockResolvedValue({});

      await updateEvent(mockDb, {
        id: "evt_new",
        title: "Updated Prayer Meeting",
        date: "2026-09-15",
        reminderTime: "19:00",
        notes: "In person",
        tagId: "tag_2",
        reminderOffsets: ["30_min"],
      });

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Event"),
        expect.arrayContaining(["Updated Prayer Meeting", "2026-09-15", "19:00", "In person", "tag_2"]),
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM EventAlert WHERE eventId = ?"),
        ["evt_new"],
      );
    });

    it("deletes an event and its alerts", async () => {
      mockDb.runAsync.mockResolvedValue({});

      await deleteEvent(mockDb, "evt_new");

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM EventAlert WHERE eventId = ?"),
        ["evt_new"],
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM Event WHERE id = ?"),
        ["evt_new"],
      );
    });
  });
});
