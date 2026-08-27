import type { SQLiteDatabase } from "expo-sqlite";

export type ReminderOffset =
  | "at_time"
  | "30_min"
  | "1_hour"
  | "2_hours"
  | "1_day"
  | "2_days"
  | "1_week";

export type TagRow = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type EventRow = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (stored in GC)
  reminderTime: string | null;
  notes: string | null;
  tagId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventAlertRow = {
  id: string;
  eventId: string;
  offset: string;
  notificationId: string | null;
};

export type HydratedEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (canonical GC)
  reminderTime?: string;
  notes?: string;
  tagId?: string | null;
  tagName?: string | null;
  tagColor?: string | null;
  reminderOffsets?: ReminderOffset[];
  reminderOffset?: ReminderOffset;
  hasReminder: boolean;
};

export type CreateEventInput = {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD GC
  reminderTime?: string | null;
  notes?: string | null;
  tagId?: string | null;
  tagName?: string | null;
  tagColor?: string | null;
  reminderOffsets?: ReminderOffset[];
};

export type UpdateEventInput = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD GC
  reminderTime?: string | null;
  notes?: string | null;
  tagId?: string | null;
  tagName?: string | null;
  tagColor?: string | null;
  reminderOffsets?: ReminderOffset[];
};

/** Fetch all tags ordered by creation date */
export async function getAllTags(db: SQLiteDatabase): Promise<TagRow[]> {
  return db.getAllAsync<TagRow>(
    `SELECT id, name, color, createdAt FROM Tag ORDER BY createdAt ASC`,
  );
}

/** Insert a new tag into the Tag table */
export async function createTag(
  db: SQLiteDatabase,
  tag: { id?: string; name: string; color: string },
): Promise<TagRow> {
  const id = tag.id || `tag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO Tag (id, name, color, createdAt) VALUES (?, ?, ?, ?)`,
    [id, tag.name.trim(), tag.color, now],
  );
  return { id, name: tag.name.trim(), color: tag.color, createdAt: now };
}

/** Delete a tag by its ID */
export async function deleteTag(
  db: SQLiteDatabase,
  tagId: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM Tag WHERE id = ?`, [tagId]);
}

/** Fetch all events joined with tags and alerts */
export async function getAllEvents(db: SQLiteDatabase): Promise<HydratedEvent[]> {
  const events = await db.getAllAsync<{
    id: string;
    title: string;
    date: string;
    reminderTime: string | null;
    notes: string | null;
    tagId: string | null;
    tagName: string | null;
    tagColor: string | null;
  }>(
    `SELECT e.id, e.title, e.date, e.reminderTime, e.notes, e.tagId,
            t.name AS tagName, t.color AS tagColor
     FROM Event e
     LEFT JOIN Tag t ON t.id = e.tagId
     ORDER BY e.date ASC, e.createdAt ASC`,
  );

  if (events.length === 0) return [];

  const alerts = await db.getAllAsync<EventAlertRow>(
    `SELECT id, eventId, offset, notificationId FROM EventAlert ORDER BY id ASC`,
  );

  const alertsByEventId = new Map<string, ReminderOffset[]>();
  for (const a of alerts) {
    if (!alertsByEventId.has(a.eventId)) {
      alertsByEventId.set(a.eventId, []);
    }
    alertsByEventId.get(a.eventId)!.push(a.offset as ReminderOffset);
  }

  return events.map((e) => {
    const eventAlerts = alertsByEventId.get(e.id) ?? [];
    const hasReminder = Boolean(e.reminderTime);
    return {
      id: e.id,
      title: e.title,
      date: e.date,
      reminderTime: e.reminderTime ?? undefined,
      notes: e.notes ?? undefined,
      tagId: e.tagId,
      tagName: e.tagName,
      tagColor: e.tagColor,
      reminderOffsets: eventAlerts.length > 0 ? eventAlerts : undefined,
      reminderOffset: eventAlerts.length > 0 ? eventAlerts[0] : undefined,
      hasReminder,
    };
  });
}

/** Insert an event and its alert offsets inside a transaction */
export async function createEvent(
  db: SQLiteDatabase,
  input: CreateEventInput,
): Promise<HydratedEvent> {
  const id = input.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const reminderTime = input.reminderTime?.trim() || null;
  const notes = input.notes?.trim() || null;
  const tagId = input.tagId || null;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO Event (id, title, date, reminderTime, notes, tagId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.title.trim(), input.date, reminderTime, notes, tagId, now, now],
    );

    if (reminderTime && input.reminderOffsets && input.reminderOffsets.length > 0) {
      for (const offset of input.reminderOffsets) {
        const alertId = `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await db.runAsync(
          `INSERT OR IGNORE INTO EventAlert (id, eventId, offset, notificationId)
           VALUES (?, ?, ?, NULL)`,
          [alertId, id, offset],
        );
      }
    }
  });

  return {
    id,
    title: input.title.trim(),
    date: input.date,
    reminderTime: reminderTime ?? undefined,
    notes: notes ?? undefined,
    tagId,
    tagName: input.tagName ?? undefined,
    tagColor: input.tagColor ?? undefined,
    reminderOffsets: input.reminderOffsets,
    reminderOffset: input.reminderOffsets?.[0],
    hasReminder: Boolean(reminderTime),
  };
}

/** Update an event and its alert offsets inside a transaction */
export async function updateEvent(
  db: SQLiteDatabase,
  input: UpdateEventInput,
): Promise<void> {
  const now = new Date().toISOString();
  const reminderTime = input.reminderTime?.trim() || null;
  const notes = input.notes?.trim() || null;
  const tagId = input.tagId || null;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE Event
       SET title = ?, date = ?, reminderTime = ?, notes = ?, tagId = ?, updatedAt = ?
       WHERE id = ?`,
      [input.title.trim(), input.date, reminderTime, notes, tagId, now, input.id],
    );

    // Delete existing alerts and re-insert new ones
    await db.runAsync(`DELETE FROM EventAlert WHERE eventId = ?`, [input.id]);

    if (reminderTime && input.reminderOffsets && input.reminderOffsets.length > 0) {
      for (const offset of input.reminderOffsets) {
        const alertId = `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await db.runAsync(
          `INSERT OR IGNORE INTO EventAlert (id, eventId, offset, notificationId)
           VALUES (?, ?, ?, NULL)`,
          [alertId, input.id, offset],
        );
      }
    }
  });
}

/** Delete an event and its associated alerts inside a transaction */
export async function deleteEvent(
  db: SQLiteDatabase,
  eventId: string,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM EventAlert WHERE eventId = ?`, [eventId]);
    await db.runAsync(`DELETE FROM Event WHERE id = ?`, [eventId]);
  });
}
