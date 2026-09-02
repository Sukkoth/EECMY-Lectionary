import {
  parseTimeString,
  calculateEventTriggerDate,
  formatEventNotificationBody,
  scheduleEventNotification,
  cancelEventNotification,
  pinEventNotification,
  unpinEventNotification,
  EVENTS_CHANNEL_ID,
  PINNED_EVENTS_CHANNEL_ID,
} from "../lib/NotificationService";
import * as Notifications from "expo-notifications";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted", canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted", canAskAgain: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("eecmy-event-evt_1-at_time"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  SchedulableTriggerInputTypes: {
    DATE: "date",
  },
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
  },
  AndroidNotificationVisibility: {
    PUBLIC: 1,
  },
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
    UNDETERMINED: "undetermined",
  },
}));

describe("Event Notifications", () => {
  describe("parseTimeString", () => {
    it("parses 12-hour PM times correctly", () => {
      expect(parseTimeString("04:33 PM")).toEqual({ hours: 16, minutes: 33 });
      expect(parseTimeString("4:30 pm")).toEqual({ hours: 16, minutes: 30 });
      expect(parseTimeString("12:00 PM")).toEqual({ hours: 12, minutes: 0 });
    });

    it("parses 12-hour AM times correctly", () => {
      expect(parseTimeString("04:33 AM")).toEqual({ hours: 4, minutes: 33 });
      expect(parseTimeString("12:00 AM")).toEqual({ hours: 0, minutes: 0 });
      expect(parseTimeString("07:15 AM")).toEqual({ hours: 7, minutes: 15 });
    });

    it("parses 24-hour times correctly", () => {
      expect(parseTimeString("16:33")).toEqual({ hours: 16, minutes: 33 });
      expect(parseTimeString("09:05")).toEqual({ hours: 9, minutes: 5 });
    });
  });

  describe("calculateEventTriggerDate", () => {
    it("computes exact trigger timestamp for 12-hour PM string in future", () => {
      const future = new Date(Date.now() + 86400000);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, "0");
      const d = String(future.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const trigger = calculateEventTriggerDate(dateStr, "04:33 PM", "at_time");
      expect(trigger).not.toBeNull();
      expect(trigger?.getHours()).toBe(16);
      expect(trigger?.getMinutes()).toBe(33);
    });
    it("computes exact trigger timestamp for at_time offset in future", () => {
      // 1 day in the future
      const future = new Date(Date.now() + 86400000);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, "0");
      const d = String(future.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const trigger = calculateEventTriggerDate(dateStr, "14:00", "at_time");
      expect(trigger).not.toBeNull();
      expect(trigger?.getHours()).toBe(14);
      expect(trigger?.getMinutes()).toBe(0);
    });

    it("subtracts 30 minutes for 30_min offset", () => {
      const future = new Date(Date.now() + 86400000);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, "0");
      const d = String(future.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const trigger = calculateEventTriggerDate(dateStr, "14:00", "30_min");
      expect(trigger).not.toBeNull();
      expect(trigger?.getHours()).toBe(13);
      expect(trigger?.getMinutes()).toBe(30);
    });

    it("returns null for past event dates", () => {
      const trigger = calculateEventTriggerDate("2020-01-01", "10:00", "at_time");
      expect(trigger).toBeNull();
    });
  });

  describe("formatEventNotificationBody", () => {
    it("formats message with time prefix and optional notes", () => {
      const bodyWithNotes = formatEventNotificationBody("30_min", "18:00", "Bring choir robe");
      expect(bodyWithNotes).toBe("Starting in 30 minutes • Bring choir robe");

      const bodyWithoutNotes = formatEventNotificationBody("1_hour", "18:00", null);
      expect(bodyWithoutNotes).toBe("Starting in 1 hour");
    });
  });

  describe("scheduleEventNotification & cancelEventNotification", () => {
    it("schedules event notification with correct channel and trigger", async () => {
      const future = new Date(Date.now() + 86400000);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, "0");
      const d = String(future.getDate()).padStart(2, "0");

      const notifId = await scheduleEventNotification(
        {
          id: "evt_1",
          title: "Choir Rehearsal",
          date: `${y}-${m}-${d}`,
          reminderTime: "18:30",
          notes: "Sanctuary",
        },
        "30_min",
      );

      expect(notifId).toBe("eecmy-event-evt_1-30_min");
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: "eecmy-event-evt_1-30_min",
          content: expect.objectContaining({
            title: "Choir Rehearsal",
            body: expect.stringContaining("Starting in 30 minutes"),
            data: { url: "/calendar", eventId: "evt_1", date: `${y}-${m}-${d}` },
          }),
          trigger: expect.objectContaining({
            type: "date",
            date: expect.any(Date),
          }),
        }),
      );
    });

    it("cancels scheduled notification", async () => {
      await cancelEventNotification("eecmy-event-evt_1-30_min");
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        "eecmy-event-evt_1-30_min",
      );
    });
  });

  describe("pinEventNotification & unpinEventNotification", () => {
    it("pins event notification immediately with sticky and ongoing attributes", async () => {
      const pinId = await pinEventNotification({
        id: "evt_pin_1",
        title: "Important Board Meeting",
        date: "2026-09-20",
        reminderTime: "10:00 AM",
        notes: "Conference Room A",
      });

      expect(pinId).toBe("eecmy-pinned-evt_pin_1");
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: "eecmy-pinned-evt_pin_1",
          content: expect.objectContaining({
            title: "📌 Important Board Meeting",
            body: expect.stringContaining("2026-09-20 at 10:00 AM • Conference Room A"),
            sticky: true,
            autoDismiss: false,
          }),
          trigger: null,
        }),
      );
    });

    it("unpins event notification by dismissing and canceling", async () => {
      await unpinEventNotification("evt_pin_1");
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith("eecmy-pinned-evt_pin_1");
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("eecmy-pinned-evt_pin_1");
    });
  });
});
