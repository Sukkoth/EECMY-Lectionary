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
  type: "eecmy" | "christian" | "others";
  name: string;
};
