import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import * as IntentLauncher from "expo-intent-launcher";
import type { SQLiteDatabase } from "expo-sqlite";
import { ReadingsDB, type DayData } from "./database";
import { stripFormattedTags } from "./formatText";

export const NOTIFICATION_PREFIX = "eecmy-daily-";
export const DAILY_CHANNEL_ID = "daily";
export const EVENT_NOTIFICATION_PREFIX = "eecmy-event-";
export const EVENTS_CHANNEL_ID = "events";

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
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
      sound: "default",
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync(EVENTS_CHANNEL_ID, {
      name: "Calendar Event Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
      sound: "default",
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    console.log(`[NotificationService] Channels '${DAILY_CHANNEL_ID}' and '${EVENTS_CHANNEL_ID}' configured successfully.`);
  } catch (err) {
    console.warn("[NotificationService] Warning setting notification channels:", err);
  }
}

export async function getPermissionStatus(): Promise<PermissionResult> {
  try {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Permission check timeout")), 3000);
      timeoutId?.unref?.();
    });
    const res = await Promise.race([
      Notifications.getPermissionsAsync(),
      timeoutPromise,
    ]).finally(() => clearTimeout(timeoutId));
    const granted = res.status === Notifications.PermissionStatus.GRANTED;
    return { granted, canAskAgain: res.canAskAgain };
  } catch {
    return { granted: false, canAskAgain: false };
  }
}

export async function ensurePermissions(): Promise<PermissionResult> {
  try {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Permission request timeout")), 3500);
      timeoutId?.unref?.();
    });

    const action = async (): Promise<PermissionResult> => {
      let { status, canAskAgain } = await Notifications.getPermissionsAsync();
      if (status !== Notifications.PermissionStatus.GRANTED && canAskAgain) {
        ({ status, canAskAgain } = await Notifications.requestPermissionsAsync());
      }
      return { granted: status === Notifications.PermissionStatus.GRANTED, canAskAgain };
    };

    return await Promise.race([action(), timeoutPromise]).finally(() => clearTimeout(timeoutId));
  } catch (err) {
    console.warn("[NotificationService] Permission check timed out or failed:", err);
    return { granted: false, canAskAgain: false };
  }
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (err) {
    console.warn("[NotificationService] Could not open system settings:", err);
  }
}

/**
 * Directly prompts or opens the Android Battery Optimization settings screen
 * so the user can switch the app to Unrestricted / Don't optimize.
 */
export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS === "android") {
    const pkgName = "com.sukkoth.eecmylectionary";
    try {
      // Direct intent requesting ignore battery optimization for this app
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        { data: `package:${pkgName}` }
      );
      return;
    } catch {
      try {
        // Fallback to system-wide battery optimization list screen
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
        return;
      } catch (err) {
        console.warn("[NotificationService] Could not open battery optimization intent:", err);
      }
    }
  }

  // Fallback to app settings
  try {
    await Linking.openSettings();
  } catch (err) {
    console.warn("[NotificationService] Could not open app settings:", err);
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

export const REMINDER_OFFSET_MILLIS = {
  at_time: 0,
  "30_min": 30 * 60 * 1000,
  "1_hour": 60 * 60 * 1000,
  "2_hours": 2 * 60 * 60 * 1000,
  "1_day": 24 * 60 * 60 * 1000,
  "2_days": 2 * 24 * 60 * 60 * 1000,
  "1_week": 7 * 24 * 60 * 60 * 1000,
} as const;

export type EventReminderOffset = keyof typeof REMINDER_OFFSET_MILLIS;

/** Robustly parse both 12-hour (04:33 PM) and 24-hour (16:33) time strings */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim().toUpperCase();
  const isPM = trimmed.includes("PM");
  const isAM = trimmed.includes("AM");
  const cleanStr = trimmed.replace(/[A-Z\s]/g, "");
  const parts = cleanStr.split(":");
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/** Calculate exact trigger timestamp for a calendar event given an alert offset */
export function calculateEventTriggerDate(
  eventDate: string, // YYYY-MM-DD GC
  reminderTime: string, // HH:mm or HH:mm AM/PM
  offset: EventReminderOffset,
): Date | null {
  const [year, month, day] = eventDate.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  const parsedTime = parseTimeString(reminderTime);
  if (!parsedTime) {
    return null;
  }

  const baseDate = new Date(year, month - 1, day, parsedTime.hours, parsedTime.minutes, 0, 0);
  const offsetMs = REMINDER_OFFSET_MILLIS[offset] ?? 0;
  const triggerTime = baseDate.getTime() - offsetMs;

  // Do not schedule if already in the past
  if (triggerTime <= Date.now()) {
    return null;
  }

  return new Date(triggerTime);
}

/** Format human-friendly notification body text */
export function formatEventNotificationBody(
  offset: EventReminderOffset,
  timeString?: string | null,
  notes?: string | null,
): string {
  let timePrefix = "";
  switch (offset) {
    case "at_time":
      timePrefix = timeString ? `Starting now (${timeString})` : "Starting now";
      break;
    case "30_min":
      timePrefix = "Starting in 30 minutes";
      break;
    case "1_hour":
      timePrefix = "Starting in 1 hour";
      break;
    case "2_hours":
      timePrefix = "Starting in 2 hours";
      break;
    case "1_day":
      timePrefix = timeString ? `Tomorrow at ${timeString}` : "Tomorrow";
      break;
    case "2_days":
      timePrefix = timeString ? `In 2 days at ${timeString}` : "In 2 days";
      break;
    case "1_week":
      timePrefix = timeString ? `Next week at ${timeString}` : "In 1 week";
      break;
  }

  if (notes) {
    return `${timePrefix} • ${notes}`;
  }
  return timePrefix;
}

/** Schedule a single alert notification with the OS for a custom event */
export async function scheduleEventNotification(
  event: {
    id: string;
    title: string;
    date: string;
    reminderTime?: string | null;
    notes?: string | null;
  },
  offset: EventReminderOffset,
): Promise<string | null> {
  if (!event.reminderTime) {
    console.log("[NotificationService] ⏭ No reminderTime set, skipping notification:", event.title);
    return null;
  }

  const triggerDate = calculateEventTriggerDate(event.date, event.reminderTime, offset);
  if (!triggerDate) {
    console.log(
      `[NotificationService] ⏭ Trigger date in past or invalid for "${event.title}" (${event.date} ${event.reminderTime}, offset: ${offset})`,
    );
    return null;
  }

  const identifier = `${EVENT_NOTIFICATION_PREFIX}${event.id}-${offset}`;
  const body = formatEventNotificationBody(offset, event.reminderTime, event.notes);

  console.log(
    `[NotificationService] 🔔 Scheduling notification: "${event.title}" | offset: ${offset} | trigger: ${triggerDate.toLocaleString()} | id: ${identifier}`,
  );

  try {
    const triggerInput: any = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    };
    if (Platform.OS === "android") {
      triggerInput.channelId = EVENTS_CHANNEL_ID;
    }

    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Notification scheduling timeout")), 3500);
      timeoutId?.unref?.();
    });

    await Promise.race([
      Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: event.title,
          body,
          sound: true,
          data: { url: "/calendar", eventId: event.id, date: event.date },
          ...(Platform.OS === "android" ? { channelId: EVENTS_CHANNEL_ID } : {}),
        },
        trigger: triggerInput,
      }),
      timeoutPromise,
    ]).finally(() => {
      clearTimeout(timeoutId);
    });

    console.log(`[NotificationService] ✓ Event notification scheduled successfully: ${identifier}`);
    return identifier;
  } catch (err) {
    console.warn(`[NotificationService] ✗ Failed to schedule event notification ${identifier}:`, err);
    return null;
  }
}

/** Cancel a scheduled notification by identifier */
export async function cancelEventNotification(notificationId: string): Promise<void> {
  try {
    console.log(`[NotificationService] 🚫 Canceling notification: ${notificationId}`);
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Cancel notification timeout")), 2500);
      timeoutId?.unref?.();
    });
    await Promise.race([
      Notifications.cancelScheduledNotificationAsync(notificationId),
      timeoutPromise,
    ]).finally(() => clearTimeout(timeoutId));
  } catch (err) {
    console.warn(`[NotificationService] ✗ Failed to cancel notification ${notificationId}:`, err);
  }
}

/** Cancel all potential scheduled notifications for a given event ID across all possible offsets */
export async function cancelAllEventNotifications(eventId: string): Promise<void> {
  const offsets = Object.keys(REMINDER_OFFSET_MILLIS) as EventReminderOffset[];
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Cancel all notifications timeout")), 3000);
    timeoutId?.unref?.();
  });

  try {
    await Promise.race([
      Promise.allSettled(
        offsets.map((offset) => {
          const identifier = `${EVENT_NOTIFICATION_PREFIX}${eventId}-${offset}`;
          return cancelEventNotification(identifier);
        }),
      ),
      timeoutPromise,
    ]).finally(() => clearTimeout(timeoutId));
  } catch (err) {
    console.warn(`[NotificationService] ✗ Batch cancellation timed out for event ${eventId}:`, err);
  }
}
