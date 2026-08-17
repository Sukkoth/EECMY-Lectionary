import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  fetchManifest,
  getInstalledVersionsWithContentVersion,
  getInstalledLangPacksWithContentVersion,
} from "../content";


export type UpdateInfo = {
  year: number;
  lang?: string;
  version?: string;
};

export function useCheckContentUpdate() {
  const db = useSQLiteContext();
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const checkUpdate = useCallback(async () => {
    try {
      setChecking(true);
      const manifest = await fetchManifest();
      if (!manifest || !manifest.years) {
        setHasUpdate(false);
        setUpdateInfo(null);
        return;
      }

      const [installedVersions, installedLangPacks] = await Promise.all([
        getInstalledVersionsWithContentVersion(db),
        getInstalledLangPacksWithContentVersion(db),
      ]);

      let updateFound = false;
      let firstUpdate: UpdateInfo | null = null;

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
              firstUpdate = { year: yearOpt.year, lang: langOpt.code, version: verOpt.code };
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
              firstUpdate = { year: yearOpt.year, lang: langOpt.code };
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
              firstUpdate = { year: yearOpt.year, lang: langOpt.code };
              break;
            }
          }
        }
        if (updateFound) break;
      }

      setHasUpdate(updateFound);
      setUpdateInfo(firstUpdate);
    } catch (err) {
      console.warn("Check update failed:", err);
      setHasUpdate(false);
      setUpdateInfo(null);
    } finally {
      setChecking(false);
    }
  }, [db]);

  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  return { hasUpdate, checking, checkUpdate, updateInfo };
}
