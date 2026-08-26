import { useState } from "react";
import { Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useQuery } from "@tanstack/react-query";
import { useSettings } from "@/lib/SettingsContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type VersionBadgeProps = {
  version: string;
  fullName?: string;
  shortName?: string;
  className?: string;
};

export default function VersionBadge({
  version,
  fullName,
  shortName,
  className = "",
}: VersionBadgeProps) {
  const { settings, updateSetting, availableLanguages } = useSettings();
  const db = useSQLiteContext();

  const isExpanded = settings.showVersionFullName;

  const code = (version || "").toLowerCase();
  const displayShort = (shortName || version || "").toUpperCase();

  // 1. Fetch real versionFullName directly from SQLite SyncRecord table
  const { data: dbVersionFullName } = useQuery({
    queryKey: ["syncRecordVersionFullName", code],
    queryFn: async () => {
      if (!db || !code) return null;
      const row = await db.getFirstAsync<{ versionFullName: string }>(
        `SELECT versionFullName 
         FROM SyncRecord 
         WHERE LOWER(version) = LOWER(?) AND versionFullName IS NOT NULL AND versionFullName != '' 
         LIMIT 1`,
        [code],
      );
      return row?.versionFullName ?? null;
    },
    staleTime: Infinity,
  });

  // 2. Fallback to availableLanguages (also loaded directly from SyncRecord query on boot)
  const cachedFullName = (() => {
    for (const lang of availableLanguages) {
      const found = lang.versions.find((v) => v.code.toLowerCase() === code);
      if (found?.label && found.label.toUpperCase() !== displayShort) {
        return found.label;
      }
    }
    return null;
  })();

  const resolvedFullName = fullName || dbVersionFullName || cachedFullName || displayShort;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateSetting("showVersionFullName", !settings.showVersionFullName);
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.75}
      className={`rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-100/80 dark:bg-stone-800/80 px-3 py-1 flex-row items-center justify-center ${className}`}
    >
      <Text
        allowFontScaling={false}
        className="text-xs font-semibold text-primary uppercase tracking-wider text-center"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
      >
        {isExpanded ? resolvedFullName : displayShort}
      </Text>
    </TouchableOpacity>
  );
}
