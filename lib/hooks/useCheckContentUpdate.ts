import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useSQLiteContext } from "expo-sqlite";
import { gregorianToEthiopian } from "../ethiopianCalendar";
import {
  fetchManifest,
  getInstalledVersionsWithContentVersion,
  getInstalledLangPacksWithContentVersion,
  getSyncedReadingVersions,
  DISABLE_UPDATE_THROTTLE,
} from "../content";

const LAST_CHECK_KEY = "yeilet_last_content_update_check_time";
const CACHED_HAS_UPDATE_KEY = "yeilet_cached_has_update";
const CACHED_UPDATE_INFO_KEY = "yeilet_cached_update_info";
const THROTTLE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours on successful check

export type UpdateInfo = {
  year: number;
  lang?: string;
  version?: string;
  isUpcomingYear?: boolean;
};

export function useCheckContentUpdate() {
  const db = useSQLiteContext();
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // Restore cached state on initial mount so the indicator displays immediately without waiting for network
  useEffect(() => {
    (async () => {
      try {
        const [savedHasUpdate, savedUpdateInfo] = await Promise.all([
          SecureStore.getItemAsync(CACHED_HAS_UPDATE_KEY),
          SecureStore.getItemAsync(CACHED_UPDATE_INFO_KEY),
        ]);
        if (savedHasUpdate === "true") {
          setHasUpdate(true);
          if (savedUpdateInfo) {
            setUpdateInfo(JSON.parse(savedUpdateInfo));
          }
        }
      } catch {}
    })();
  }, []);

  const checkUpdate = useCallback(
    async (force = false) => {
      try {
        // If not forced and throttle is not explicitly disabled via env, verify if 12-hour interval has passed
        if (!force && !DISABLE_UPDATE_THROTTLE) {
          try {
            const lastCheckStr = await SecureStore.getItemAsync(LAST_CHECK_KEY);
            if (lastCheckStr) {
              const lastCheck = parseInt(lastCheckStr, 10);
              if (!isNaN(lastCheck) && Date.now() - lastCheck < THROTTLE_INTERVAL_MS) {
                const remainingMinutes = Math.round((THROTTLE_INTERVAL_MS - (Date.now() - lastCheck)) / (1000 * 60));
                console.log(`[ContentUpdate] ⏭️ Skipping background check (throttled. Next check in ${remainingMinutes} mins)`);
                return;
              }
            }
          } catch {}
        }

        console.log(`[ContentUpdate] 🔍 Performing update check (force: ${force})...`);
        setChecking(true);
        const manifest = await fetchManifest(force);
        if (!manifest || !manifest.years) {
          setHasUpdate(false);
          setUpdateInfo(null);
          await Promise.all([
            SecureStore.setItemAsync(CACHED_HAS_UPDATE_KEY, "false"),
            SecureStore.deleteItemAsync(CACHED_UPDATE_INFO_KEY),
            SecureStore.setItemAsync(LAST_CHECK_KEY, String(Date.now())),
          ]);
          return;
        }

        const [installedVersions, installedLangPacks] = await Promise.all([
          getInstalledVersionsWithContentVersion(db),
          getInstalledLangPacksWithContentVersion(db),
        ]);

        let updateFound = false;
        let primaryYear: number | null = null;
        let isUpcomingYear = false;

        for (const yearOpt of manifest.years) {
          for (const langOpt of yearOpt.languages) {
            // Check Bible Versions (only if ALREADY installed)
            for (const verOpt of langOpt.versions) {
              const match = installedVersions.find(
                (r) =>
                  r.language.toLowerCase() === langOpt.code.toLowerCase() &&
                  r.version.toLowerCase() === verOpt.code.toLowerCase(),
              );
              if (match && Number(match.contentVersion) < Number(verOpt.contentVersion)) {
                updateFound = true;
                if (primaryYear == null) {
                  primaryYear = yearOpt.year;
                }
              }
            }

            // Check Holidays (only if ALREADY installed for this language)
            if (langOpt.holidays && langOpt.holidays.version > 0) {
              const matchHolidays = installedLangPacks.find(
                (r) =>
                  r.language.toLowerCase() === langOpt.code.toLowerCase() &&
                  r.type === "holidays",
              );
              if (
                matchHolidays &&
                Number(matchHolidays.contentVersion) < Number(langOpt.holidays.version)
              ) {
                updateFound = true;
                if (primaryYear == null) {
                  primaryYear = yearOpt.year;
                }
              }
            }

            // Check DayInfo (only if ALREADY installed for this language)
            if (langOpt.dayInfo && langOpt.dayInfo.version > 0) {
              const matchDayInfo = installedLangPacks.find(
                (r) =>
                  r.language.toLowerCase() === langOpt.code.toLowerCase() &&
                  r.type === "day-info",
              );
              if (
                matchDayInfo &&
                Number(matchDayInfo.contentVersion) < Number(langOpt.dayInfo.version)
              ) {
                updateFound = true;
                if (primaryYear == null) {
                  primaryYear = yearOpt.year;
                }
              }
            }
          }
        }

        // Check for upcoming year transition (Nehase / Month 12 = 11, Pagume / Month 13 = 12 in 0-indexed EC)
        const ethDate = gregorianToEthiopian(new Date());
        const isYearEndTransition = ethDate.month >= 11;

        if (isYearEndTransition) {
          const nextEthYear = ethDate.year + 1;
          const nextYearManifest = manifest.years.find((y) => Number(y.year) === Number(nextEthYear));

          if (nextYearManifest) {
            const nextYearSynced = await getSyncedReadingVersions(db);
            const hasDownloadedNextYear = nextYearSynced.some(
              (s) => Number(s.year) === Number(nextEthYear),
            );

            if (!hasDownloadedNextYear) {
              updateFound = true;
              isUpcomingYear = true;
              primaryYear = nextEthYear;
            }
          }
        }

        const nextUpdateInfo =
          updateFound && primaryYear != null
            ? { year: primaryYear, isUpcomingYear }
            : null;

        setHasUpdate(updateFound);
        setUpdateInfo(nextUpdateInfo);
        console.log(`[ContentUpdate] ✅ Update check completed (updateFound: ${updateFound})`);

        // Update cache & timestamp in storage (12-hour window starts ONLY on successful check)
        await Promise.all([
          SecureStore.setItemAsync(LAST_CHECK_KEY, String(Date.now())),
          SecureStore.setItemAsync(CACHED_HAS_UPDATE_KEY, updateFound ? "true" : "false"),
          nextUpdateInfo
            ? SecureStore.setItemAsync(CACHED_UPDATE_INFO_KEY, JSON.stringify(nextUpdateInfo))
            : SecureStore.deleteItemAsync(CACHED_UPDATE_INFO_KEY),
        ]);
      } catch (err) {
        // Network/server error: do NOT set 12-hour timestamp, so app retries immediately when data is turned on
        console.warn("Check update failed (network or server unreachable):", err);
      } finally {
        setChecking(false);
      }
    },
    [db],
  );

  useEffect(() => {
    checkUpdate(false);
  }, [checkUpdate]);

  return { hasUpdate, checking, checkUpdate, updateInfo };
}
