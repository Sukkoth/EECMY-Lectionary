import * as Notifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";
import { ReadingsDB, type DayData } from "./database";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
}

export async function cancelAllReminders(): Promise<void> {
  try {
    const cancelPromise = Notifications.cancelAllScheduledNotificationsAsync();
    const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 500));
    await Promise.race([cancelPromise, timeoutPromise]);
  } catch (err) {
    console.warn("[NotificationService] Warning during cancelAllReminders:", err);
  }
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  db: SQLiteDatabase,
  language: string,
  version: string,
  appTitle: string = "EECMY Lectionary",
  daysAheadCount: number = 21,
): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await cancelAllReminders();
  // Pause 100ms to allow native Android AlarmManager DB transaction to settle after cancellation
  await new Promise((resolve) => setTimeout(resolve, 100));

  const now = new Date();
  const readingsDB = new ReadingsDB(db);
  const verUpper = (version || "niv").toUpperCase();

  const targets: Array<{ targetDate: Date; body: string }> = [];
  const targetDays = Math.min(Math.max(1, daysAheadCount), 21);

  // Phase 1: Pre-fetch all days from SQLite DB
  for (let i = 0; i < targetDays; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    targetDate.setHours(hour, minute, 0, 0);

    // Skip if today's target time has already passed
    if (targetDate.getTime() <= now.getTime()) {
      continue;
    }

    let dayData: DayData | null = null;
    try {
      dayData = await readingsDB.getReadingsForDate(targetDate, language, version);
    } catch {
      dayData = null;
    }

    let body = "";

    if (dayData && dayData.readings.length > 0) {
      if (dayData.readings.length === 1) {
        const reading = dayData.readings[0];
        const text = reading.text?.trim() ?? "";
        const ref = reading.reference?.trim() ?? "";

        if (text.length > 0 && text.length <= 240) {
          body = `"${text}"\n\n— ${ref} [${verUpper}]`;
        } else if (ref.length > 0) {
          body = `— ${ref} [${verUpper}]`;
        }
      } else {
        const references = dayData.readings
          .map((r) => r.reference?.trim())
          .filter(Boolean)
          .join(" • ");
        if (references.length > 0) {
          body = `${references} [${verUpper}]`;
        }
      }
    }

    if (!body) {
      body = "Open the app to read today's lectionary passage.";
    }

    targets.push({ targetDate, body });
  }

  // Phase 2: Batch scheduling (7 items per concurrent chunk using Promise.all)
  const CONCURRENCY = 7;

  for (let c = 0; c < targets.length; c += CONCURRENCY) {
    const chunk = targets.slice(c, c + CONCURRENCY);

    await Promise.all(
      chunk.map(async (item) => {
        try {
          const schedPromise = Notifications.scheduleNotificationAsync({
            content: {
              title: appTitle,
              body: item.body,
              sound: true,
              data: { url: "/reading" },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: item.targetDate.getTime(),
            },
          });

          const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Item timeout")), 3000)
          );

          await Promise.race([schedPromise, timeoutPromise]);
        } catch (err) {
          console.warn("[NotificationService] Item skipped or timed out:", err);
        }
      })
    );
  }

  return true;
}
