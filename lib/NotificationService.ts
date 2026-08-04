import * as Notifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";
import { ReadingsDB, type DayData } from "./database";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  db: SQLiteDatabase,
  language: string,
  version: string,
  appTitle: string = "EECMY Lectionary",
  daysAheadCount: number = 30,
): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await cancelAllReminders();

  const readingsDB = new ReadingsDB(db);
  const now = new Date();
  const verUpper = (version || "niv").toUpperCase();

  for (let i = 0; i < daysAheadCount; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    targetDate.setHours(hour, minute, 0, 0);

    // If today's time has already passed, skip today
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
        // Weekday (Single Reading)
        const reading = dayData.readings[0];
        const text = reading.text?.trim() ?? "";
        const ref = reading.reference?.trim() ?? "";

        if (text.length > 0 && text.length <= 240) {
          body = `"${text}"\n\n— ${ref} [${verUpper}]`;
        } else if (ref.length > 0) {
          body = `— ${ref} [${verUpper}]`;
        }
      } else {
        // Sundays & Holidays (Multiple Readings)
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: appTitle,
        body: body,
        sound: true,
        data: { url: "/reading" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      },
    });
  }

  return true;
}
