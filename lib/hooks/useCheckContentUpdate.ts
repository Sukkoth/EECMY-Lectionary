import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  fetchManifest,
  getSyncedReadingVersions,
  getSyncedLangPackVersions,
} from "../content";
import { gregorianToEthiopian } from "../ethiopianCalendar";

export function useCheckContentUpdate() {
  const db = useSQLiteContext();
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  const checkUpdate = useCallback(async () => {
    try {
      setChecking(true);
      const manifest = await fetchManifest();
      if (!manifest || !manifest.years) {
        setHasUpdate(false);
        return;
      }

      const currentEthYear = gregorianToEthiopian(new Date()).year;

      const [readingVersions, langPackVersions] = await Promise.all([
        getSyncedReadingVersions(db),
        getSyncedLangPackVersions(db),
      ]);

      let updateFound = false;

      for (const yearOpt of manifest.years) {
        // Only check for updates for current year and subsequent years (ignore past years)
        if (yearOpt.year < currentEthYear) {
          continue;
        }

        for (const langOpt of yearOpt.languages) {
          // Check Bible Versions
          for (const verOpt of langOpt.versions) {
            const match = readingVersions.find(
              (r) =>
                r.year === yearOpt.year &&
                r.language === langOpt.code &&
                r.version === verOpt.code,
            );
            if (!match || match.contentVersion < verOpt.contentVersion) {
              updateFound = true;
              break;
            }
          }
          if (updateFound) break;

          // Check Holidays
          if (langOpt.holidays && langOpt.holidays.version > 0) {
            const matchHolidays = langPackVersions.find(
              (r) =>
                r.year === yearOpt.year &&
                r.language === langOpt.code &&
                r.type === "holidays",
            );
            if (!matchHolidays || matchHolidays.contentVersion < langOpt.holidays.version) {
              updateFound = true;
              break;
            }
          }

          // Check DayInfo
          if (langOpt.dayInfo && langOpt.dayInfo.version > 0) {
            const matchDayInfo = langPackVersions.find(
              (r) =>
                r.year === yearOpt.year &&
                r.language === langOpt.code &&
                r.type === "day-info",
            );
            if (!matchDayInfo || matchDayInfo.contentVersion < langOpt.dayInfo.version) {
              updateFound = true;
              break;
            }
          }
        }
        if (updateFound) break;
      }

      setHasUpdate(updateFound);
    } catch {
      // Silent error fallback when offline
      setHasUpdate(false);
    } finally {
      setChecking(false);
    }
  }, [db]);

  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  return { hasUpdate, checking, checkUpdate };
}
