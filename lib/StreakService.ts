import * as SecureStore from "expo-secure-store";
import type { ReadingStreak } from "./types";

const STREAK_KEY = "yeilet_streak";

const DEFAULT_STREAK: ReadingStreak = {
  current: 0,
  best: 0,
  completedDays: [false, false, false, false, false, false, false],
  lastCompletedDate: null,
  weekStartDate: toDateString(new Date()), // today (local)
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return toDateString(d);
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function loadStreak(): Promise<ReadingStreak> {
  try {
    const raw = await SecureStore.getItemAsync(STREAK_KEY);
    if (!raw) return { ...DEFAULT_STREAK };
    const parsed = JSON.parse(raw) as ReadingStreak;
    // Ensure all fields exist (handle upgrades from old schema)
    return {
      current: parsed.current ?? 0,
      best: parsed.best ?? 0,
      completedDays: parsed.completedDays ?? [false, false, false, false, false, false, false],
      lastCompletedDate: parsed.lastCompletedDate ?? null,
      weekStartDate: parsed.weekStartDate ?? getWeekStart(new Date()),
    };
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

async function saveStreak(streak: ReadingStreak): Promise<void> {
  await SecureStore.setItemAsync(STREAK_KEY, JSON.stringify(streak));
}

export async function markDayCompleted(date: Date): Promise<ReadingStreak> {
  const streak = await loadStreak();
  const dateStr = toDateString(date);
  const weekStart = getWeekStart(date);
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // ── Duplicate: already marked today ──
  if (streak.lastCompletedDate === dateStr) {
    // Still need to handle week boundary even if duplicate
    if (streak.weekStartDate !== weekStart) {
      const updated = {
        ...streak,
        completedDays: [false, false, false, false, false, false, false],
        weekStartDate: weekStart,
      };
      updated.completedDays[dayOfWeek] = true;
      await saveStreak(updated);
      return updated;
    }
    return streak;
  }

  // ── Week boundary: reset weekly display ──
  let completedDays = streak.completedDays;
  let weekStartDate = streak.weekStartDate;
  if (streak.weekStartDate !== weekStart) {
    completedDays = [false, false, false, false, false, false, false];
    weekStartDate = weekStart;
  }

  // ── Consecutive check ──
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  const isConsecutive = streak.lastCompletedDate === yesterdayStr;
  const newCurrent = isConsecutive ? streak.current + 1 : 1;
  const newBest = Math.max(streak.best, newCurrent);

  // ── Update weekly display ──
  const newCompletedDays = [...completedDays];
  newCompletedDays[dayOfWeek] = true;

  const updated: ReadingStreak = {
    current: newCurrent,
    best: newBest,
    completedDays: newCompletedDays,
    lastCompletedDate: dateStr,
    weekStartDate,
  };

  await saveStreak(updated);
  return updated;
}
