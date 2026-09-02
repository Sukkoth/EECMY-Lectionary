# Notification Debugging Report & Fix Specification

## Overview & Environment

- **App**: YeiLet / EECMY Lectionary (`com.sukkoth.eecmylectionary`)
- **Device Tested**: Samsung Galaxy A31 (`SM-A315F`), Android 12 (API 31)
- **Symptom**: Notifications fail to schedule or cancel, hanging indefinitely on `await` calls and freezing the notification workflow.

---

## 1. Diagnostics & Root Cause Analysis

Live ADB logcat debugging on the connected Samsung device revealed the following error in `ExpoModulesCore`:

```text
E ExpoModulesCore: Invalidated JavaCallback was invoked
E ExpoModulesCore: java.lang.NullPointerException: java.lang.NullPointerException
	at expo.modules.kotlin.jni.JavaCallback.invokeNative(Native Method)
	at expo.modules.kotlin.jni.JavaCallback.invoke(JavaCallback.kt:65)
	at expo.modules.kotlin.jni.PromiseImpl.resolve(PromiseImpl.kt:45)
	at expo.modules.notifications.notifications.scheduling.NotificationScheduler...
	at expo.modules.notifications.notifications.presentation.ExpoNotificationPresentationModule.dismissNotificationAsync...
	at expo.modules.notifications.notifications.scheduling.NotificationScheduler.cancelScheduledNotificationAsync...
```

### Why the Promise Hangs
1. **Parallel Native Calls Colliding in JNI**:
   `expo-notifications` communicates with Android services using a Kotlin JNI bridge (`JavaCallback` / `PromiseImpl`). When multiple cancel or dismiss calls are fired simultaneously via `Promise.all` or `Promise.allSettled`, the native `ResultReceiver` invokes callbacks after their JNI handles are invalidated, causing a native `NullPointerException`.
2. **Silent Native Crash Prevents Promise Settlement**:
   Because the exception occurs inside JNI `JavaCallback.invokeNative`, the JavaScript Promise is **never resolved or rejected**, remaining stuck in an unresolved `await` state forever.
3. **Trigger Loop from Home Screen Focus**:
   `app/(tabs)/index.tsx` triggered `scheduleDailyReminder()` inside `useFocusEffect` on every tab switch. This constantly wiped and rescheduled 14 days of notifications in parallel, keeping the bridge in a perpetual error state.

---

## 2. Identified Bug Locations

| File | Lines | Problem |
| :--- | :--- | :--- |
| `lib/NotificationService.ts` | 187–189 | `Promise.all` executes 14 concurrent `cancelScheduledNotificationAsync` calls. |
| `lib/NotificationService.ts` | 612–615 | `Promise.allSettled` runs `dismissNotificationAsync` and `cancelScheduledNotificationAsync` simultaneously on the same notification ID. |
| `lib/NotificationService.ts` | 526–532 | `Promise.allSettled` runs 7 reminder offsets + unpin concurrently. |
| `lib/NotificationService.ts` | 294–307 | Phase 2 scheduling loop lacks individual `Promise.race` timeout guards. |
| `app/(tabs)/index.tsx` | 74–101 | `useFocusEffect` reschedules all 14 days on every screen focus rather than checking existing state. |

---

## 3. Required Code Changes

### A. Fix `lib/NotificationService.ts`

#### 1. Sequential Cancellation in `cancelDailyReminder`
Replace `Promise.all` with a sequential `for...of` loop:

```diff
- export async function cancelDailyReminder(): Promise<void> {
-   try {
-     const scheduled = await Notifications.getAllScheduledNotificationsAsync();
-     const matching = scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX));
-     await Promise.all(
-       matching.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
-     );
-     console.log(`[NotificationService] Cancelled ${matching.length} daily reminders.`);
-   } catch (err) {
-     console.warn("[NotificationService] Warning cancelling reminders:", err);
-   }
- }
+ export async function cancelDailyReminder(): Promise<void> {
+   try {
+     const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
+     const matching = scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX));
+     for (const n of matching) {
+       try {
+         await Notifications.cancelScheduledNotificationAsync(n.identifier);
+       } catch {
+         // Ignore individual cancellation failures
+       }
+     }
+     console.log(`[NotificationService] Cancelled ${matching.length} daily reminders.`);
+   } catch (err) {
+     console.warn("[NotificationService] Warning cancelling reminders:", err);
+   }
+ }
```

#### 2. Sequential Unpin in `unpinEventNotification`
Separate `dismissNotificationAsync` and `cancelScheduledNotificationAsync` into sequential steps:

```diff
- export async function unpinEventNotification(eventId: string): Promise<void> {
-   const identifier = `${PINNED_EVENT_NOTIFICATION_PREFIX}${eventId}`;
-   try {
-     console.log(`[NotificationService] 📍 Unpinning event notification: ${identifier}`);
-     let timeoutId: any;
-     const timeoutPromise = new Promise<never>((_, reject) => {
-       timeoutId = setTimeout(() => reject(new Error("Unpin notification timeout")), 2500);
-       timeoutId?.unref?.();
-     });
-     await Promise.race([
-       Promise.allSettled([
-         Notifications.dismissNotificationAsync(identifier),
-         Notifications.cancelScheduledNotificationAsync(identifier),
-       ]),
-       timeoutPromise,
-     ]).finally(() => clearTimeout(timeoutId));
-   } catch (err) {
-     console.warn(`[NotificationService] ✗ Failed to unpin notification ${identifier}:`, err);
-   }
- }
+ export async function unpinEventNotification(eventId: string): Promise<void> {
+   const identifier = `${PINNED_EVENT_NOTIFICATION_PREFIX}${eventId}`;
+   console.log(`[NotificationService] 📍 Unpinning event notification: ${identifier}`);
+   try {
+     await Notifications.dismissNotificationAsync(identifier).catch(() => {});
+     await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
+   } catch (err) {
+     console.warn(`[NotificationService] ✗ Failed to unpin notification ${identifier}:`, err);
+   }
+ }
```

#### 3. Sequential Offset Cancellation in `cancelAllEventNotifications`
Avoid running 7 alert offsets + unpin in parallel:

```diff
- export async function cancelAllEventNotifications(eventId: string): Promise<void> {
-   const offsets = Object.keys(REMINDER_OFFSET_MILLIS) as EventReminderOffset[];
-   let timeoutId: any;
-   const timeoutPromise = new Promise<never>((_, reject) => {
-     timeoutId = setTimeout(() => reject(new Error("Cancel all notifications timeout")), 3000);
-     timeoutId?.unref?.();
-   });
- 
-   try {
-     await Promise.race([
-       Promise.allSettled([
-         ...offsets.map((offset) => {
-           const identifier = `${EVENT_NOTIFICATION_PREFIX}${eventId}-${offset}`;
-           return cancelEventNotification(identifier);
-         }),
-         unpinEventNotification(eventId),
-       ]),
-       timeoutPromise,
-     ]).finally(() => clearTimeout(timeoutId));
-   } catch (err) {
-     console.warn(`[NotificationService] ✗ Batch cancellation timed out for event ${eventId}:`, err);
-   }
- }
+ export async function cancelAllEventNotifications(eventId: string): Promise<void> {
+   const offsets = Object.keys(REMINDER_OFFSET_MILLIS) as EventReminderOffset[];
+   for (const offset of offsets) {
+     const identifier = `${EVENT_NOTIFICATION_PREFIX}${eventId}-${offset}`;
+     await cancelEventNotification(identifier);
+   }
+   await unpinEventNotification(eventId);
+ }
```

#### 4. Add Timeout Guard in `scheduleDailyReminder` Phase 2
Wrap each individual schedule call with a safety timeout so a stuck native call does not hang the entire loop:

```typescript
// Helper timeout wrapper
async function safeScheduleNotification(options: Notifications.NotificationRequestInput, timeoutMs = 3000): Promise<string | null> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("SCHEDULE_TIMEOUT")), timeoutMs);
    timeoutId?.unref?.();
  });

  try {
    const id = await Promise.race([
      Notifications.scheduleNotificationAsync(options),
      timeoutPromise,
    ]);
    return id;
  } catch (err) {
    console.warn("[NotificationService] Notification schedule call failed or timed out:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

Then in `scheduleDailyReminder`:
```typescript
for (const item of itemsToSchedule) {
  const identifier = `${NOTIFICATION_PREFIX}${item.dateKey}`;
  const res = await safeScheduleNotification({
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
  if (res) scheduledSuccess++;
}
```

---

### B. Fix `app/(tabs)/index.tsx`

Avoid calling `scheduleDailyReminder()` unconditionally on every screen focus. Guard it by checking whether reminders are already scheduled:

```typescript
useFocusEffect(
  useCallback(() => {
    refetchStreak();
    checkUpdate();

    if (settings.reminderEnabled) {
      void (async () => {
        // Only schedule if count is 0 or low (e.g. less than 3 days ahead)
        const scheduledCount = await getScheduledReminderCount();
        if (scheduledCount < 3) {
          const [hStr, mStr] = (settings.reminderTime || "08:30").split(":");
          const hour = parseInt(hStr, 10) || 8;
          const minute = parseInt(mStr, 10) || 30;
          await scheduleDailyReminder(
            hour,
            minute,
            db,
            settings.language,
            settings.version,
            t("appTitle"),
          );
        }
      })();
    }
  }, [
    refetchStreak,
    checkUpdate,
    settings.reminderEnabled,
    settings.reminderTime,
    settings.language,
    settings.version,
    db,
    t,
  ]),
);
```

---

## 4. Verification Steps

1. **Clear Existing Notifications & State**:
   ```bash
   adb shell pm clear com.sukkoth.eecmylectionary
   ```
2. **Monitor Live Native Logcat**:
   ```bash
   adb logcat -c && adb logcat | grep -E "ExpoModulesCore|NotificationScheduler|NotificationService"
   ```
3. **Test Scenarios**:
   - Open Settings > Toggle Daily Reminder ON/OFF multiple times rapidly.
   - Switch between Home and Calendar tabs repeatedly. Verify that `Invalidated JavaCallback was invoked` never appears in logcat.
   - Add a custom event in Calendar with multiple alerts ("Starting now", "30 minutes before", "Pinned"). Verify that saving completes instantly and the modal dismisses without timeout.
   - Delete/Edit the event and verify clean unpinning and offset cancellation.
