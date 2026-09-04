export type ReadingStreak = {
  current: number;
  best: number;
  completedDays: boolean[]; // length = 7, index 0 = Sunday
  lastCompletedDate: string | null; // YYYY-MM-DD of last completed reading
  weekStartDate: string; // YYYY-MM-DD of the Sunday that started this week
};

export type HolidayRow = {
  id: string;
  language: string;
  date: string;
  endDate?: string | null;
  type: "eecmy" | "christian" | "other";
  name: string;
};

export type DayInfoRow = {
  id: string;
  language: string;
  date: string;
  title: string | null;
  description: string | null;
  seasonColor: string | null;
};

export type ReminderOffset =
  | "at_time"
  | "30_min"
  | "1_hour"
  | "2_hours"
  | "1_day"
  | "2_days"
  | "1_week";

export type CustomEventData = {
  id: string;
  title: string;
  tagId?: string | null;
  tagName?: string | null;
  tagColor?: string | null;
  date: string; // YYYY-MM-DD (canonical GC)
  hasReminder: boolean;
  reminderTime?: string;
  reminderOffsets?: ReminderOffset[];
  reminderOffset?: ReminderOffset;
  notes?: string;
  isPinned?: boolean;
};
