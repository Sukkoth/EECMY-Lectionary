import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import type { SQLiteDatabase } from "expo-sqlite";
import { ReadingsDB, type DayData } from "./database";
import { stripFormattedTags } from "./formatText";

export const NOTIFICATION_PREFIX = "eecmy-daily-";
export const DAILY_CHANNEL_ID = "daily";

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync(DAILY_CHANNEL_ID, {
      name: "Daily Lectionary Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
      sound: "default",
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    console.log(`[NotificationService] Channel '${DAILY_CHANNEL_ID}' configured successfully.`);
  } catch (err) {
    console.warn("[NotificationService] Warning setting notification channel:", err);
  }
}

export async function getPermissionStatus(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  const granted = status === Notifications.PermissionStatus.GRANTED;
  return { granted, canAskAgain };
}

export async function ensurePermissions(): Promise<PermissionResult> {
  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== Notifications.PermissionStatus.GRANTED && canAskAgain) {
    ({ status, canAskAgain } = await Notifications.requestPermissionsAsync());
  }
  const granted = status === Notifications.PermissionStatus.GRANTED;
  return { granted, canAskAgain };
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (err) {
    console.warn("[NotificationService] Could not open system settings:", err);
  }
}

export async function getScheduledReminderCount(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const now = Date.now();
    return scheduled.filter((n) => {
      if (!n.identifier.startsWith(NOTIFICATION_PREFIX)) return false;
      const trigger = n.trigger as any;
      const ts = trigger?.timestamp ?? trigger?.date ?? (trigger?.value ? trigger.value : 0);
      return typeof ts === "number" ? ts > now : true;
    }).length;
  } catch {
    return 0;
  }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
  const count = await getScheduledReminderCount();
  return count > 0;
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matching = scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX));
    await Promise.all(
      matching.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
    );
    console.log(`[NotificationService] Cancelled ${matching.length} daily reminders.`);
  } catch (err) {
    console.warn("[NotificationService] Warning cancelling reminders:", err);
  }
}

export async function cancelAllReminders(): Promise<void> {
  await cancelDailyReminder();
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  db?: SQLiteDatabase | null,
  language: string = "am",
  version: string = "am54",
  appTitle: string = "EECMY Lectionary",
  daysAhead: number = 14,
): Promise<boolean> {
  console.log(`[Notify] ▶ Starting schedule — ${hour}:${String(minute).padStart(2, "0")}, lang=${language}, ver=${version}, days=${daysAhead}`);

  const { granted } = await ensurePermissions();
  if (!granted) {
    console.warn("[Notify] ✗ Failed — permission not granted");
    return false;
  }

  // Cancel any existing reminders to avoid stale content (e.g. after language/version change)
  await cancelDailyReminder();

  // Ensure channel exists
  await setupNotificationChannels();

  const now = new Date();
  const verUpper = (version || "am54").toUpperCase();
  const readingsDB = db ? new ReadingsDB(db) : null;

  const targetDays = Math.min(Math.max(1, daysAhead), 14);
  const itemsToSchedule: Array<{ dateKey: string; targetDate: Date; body: string }> = [];

  // Phase 1: Pre-fetch all readings first from SQLite
  for (let i = 0; i < targetDays; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    targetDate.setHours(hour, minute, 0, 0);

    const dateKey = toDateKey(targetDate);

    // Skip if target time for today has already passed
    if (targetDate.getTime() <= now.getTime()) {
      console.log(`[Notify] ⏭ Skip ${dateKey} — time already passed`);
      continue;
    }

    let body = "";

    if (readingsDB) {
      try {
        const dayData: DayData | null = await readingsDB.getReadingsForDate(targetDate, language, version);
        if (dayData && dayData.readings.length > 0) {
          console.log(`[Notify] 📖 Fetched ${dateKey} — ${dayData.readings.length} reading(s)`);
          if (dayData.readings.length === 1) {
            const reading = dayData.readings[0];
            const rawText = reading.text?.trim() ?? "";
            const text = stripFormattedTags(rawText);
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
        } else {
          console.log(`[Notify] 📖 Fetched ${dateKey} — no readings found`);
        }
      } catch (err) {
        console.warn(`[Notify] ✗ Failed to fetch ${dateKey}:`, err);
      }
    } else {
      console.log(`[Notify] 📖 Fetched ${dateKey} — no DB available, using fallback`);
    }

    if (!body) {
      body = "Open the app to read today's lectionary passage.";
    }

    console.log(`[Notify] ＋ Adding ${dateKey}`);
    itemsToSchedule.push({ dateKey, targetDate, body });
  }

  // Phase 2: Schedule each day with unique identifier
  let scheduledSuccess = 0;
  for (const item of itemsToSchedule) {
    const identifier = `${NOTIFICATION_PREFIX}${item.dateKey}`;
    try {
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: appTitle,
          body: item.body,
          sound: true,
          data: { url: "/reading", date: item.dateKey },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.targetDate,
          channelId: DAILY_CHANNEL_ID,
        },
      });
      console.log(`[Notify] ✓ Scheduled ${item.dateKey}`);
      scheduledSuccess++;
    } catch (err) {
      console.warn(`[Notify] ✗ Failed to schedule ${item.dateKey}:`, err);
    }
  }

  console.log(`[Notify] ■ Done — ${scheduledSuccess}/${itemsToSchedule.length} scheduled`);
  return scheduledSuccess > 0;
}

// Backward compatibility alias
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { granted } = await ensurePermissions();
  return granted;
};
