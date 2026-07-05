import type { DailyReading } from "@/lib/types";

const MOCK_READINGS: DailyReading[] = [
  {
    date: new Date(2026, 6, 5),
    passage:
      '"The Lord is my shepherd; I shall not want. In verdant pastures he gives me repose; beside restful waters he leads me; he refreshes my soul."',
    reference: "Psalm 23:1–3",
    season: "Lent",
  },
  {
    date: new Date(2026, 6, 6),
    passage:
      '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are they who mourn, for they will be comforted. Blessed are the meek, for they will inherit the land."',
    reference: "Matthew 5:1–12",
    season: "Ordinary Time",
  },
];

export function getReadingForDate(
  year: number,
  month: number,
  day: number
): DailyReading | null {
  return (
    MOCK_READINGS.find((r) => {
      const d = r.date;
      return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
      );
    }) ?? null
  );
}
