/**
 * Utility to detect and format time based on the user device's 12-hour vs 24-hour configuration.
 */
export function isDevice24Hour(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rnLocalize = require("react-native-localize");
    if (rnLocalize && typeof rnLocalize.uses24HourClock === "function") {
      return Boolean(rnLocalize.uses24HourClock());
    }
  } catch {
    // Fallback gracefully if native module is unavailable (e.g. Jest or SSR)
  }
  return false;
}


export function formatTimeSlot(hour24: number, minute: number, is24H: boolean): string {
  if (is24H) {
    return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}
