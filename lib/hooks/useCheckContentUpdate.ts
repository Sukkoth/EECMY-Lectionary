import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  fetchManifest,
  getInstalledVersionsWithContentVersion,
  getInstalledLangPacksWithContentVersion,
} from "../content";


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

      const [installedVersions, installedLangPacks] = await Promise.all([
        getInstalledVersionsWithContentVersion(db),
        getInstalledLangPacksWithContentVersion(db),
      ]);

      let updateFound = false;

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
              break;
            }
          }
          if (updateFound) break;

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
              break;
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
              break;
            }
          }
        }
        if (updateFound) break;
      }

      setHasUpdate(updateFound);
    } catch (err) {
      console.warn("Check update failed:", err);
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
