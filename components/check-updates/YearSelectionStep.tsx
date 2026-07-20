import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Manifest, YearOption } from "../../app/settings/check-updates/types";

type LangPackVersion = {
  year: number;
  language: string;
  type: string;
  contentVersion: number;
};

type ReadingVersion = {
  year: number;
  language: string;
  version: string;
  contentVersion: number;
};

type Props = {
  manifest: Manifest;
  onSelectYear: (year: YearOption) => void;
  downloadedYears?: number[];
  syncedReadingCounts?: Record<number, number>;
  syncedLangPackVersions?: LangPackVersion[];
  syncedReadingVersions?: ReadingVersion[];
  isDark: boolean;
};

function YearSelectionStep({ manifest, onSelectYear, downloadedYears = [], syncedReadingCounts = {}, syncedLangPackVersions = [], syncedReadingVersions = [], isDark }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <Text
        className="mb-1 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
      >
        Select Data Year
      </Text>
      <Text
        className="text-muted dark:text-muted-dark mb-5 text-sm"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        Choose which year&apos;s reading data to download.
      </Text>

      {manifest.years.map((yearOption) => {
        const totalVersions = yearOption.languages.reduce(
          (sum: number, l) => sum + l.versions.length,
          0,
        );
        const syncedCount = syncedReadingCounts[yearOption.year] ?? 0;
        const availableCount = totalVersions - syncedCount;

        const allReadingsSynced = totalVersions > 0 && yearOption.languages.every((lang) =>
          lang.versions.every((ver) => {
            const record = syncedReadingVersions.find(
              (r) => r.year === yearOption.year && r.language === lang.code && r.version === ver.code,
            );
            return !!record && record.contentVersion >= ver.contentVersion;
          }),
        );

        const allHolidaysSynced = yearOption.languages.every((lang) => {
          if (!lang.holidays || lang.holidays.version <= 0) return true;
          const record = syncedLangPackVersions.find(
            (r) => r.year === yearOption.year && r.language === lang.code && r.type === "holidays",
          );
          return !!record && record.contentVersion >= lang.holidays.version;
        });

        const allDayInfoSynced = yearOption.languages.every((lang) => {
          if (!lang.dayInfo || lang.dayInfo.version <= 0) return true;
          const record = syncedLangPackVersions.find(
            (r) => r.year === yearOption.year && r.language === lang.code && r.type === "day-info",
          );
          return !!record && record.contentVersion >= lang.dayInfo.version;
        });

        const allSynced = allReadingsSynced && allHolidaysSynced && allDayInfoSynced;

        const cardClassName = `mb-4 rounded-2xl px-5 py-5 ${
          allSynced
            ? "bg-green-500/5 border border-green-500/20"
            : "bg-surface dark:bg-surface-dark"
        }`;

        if (allSynced) {
          return (
            <View key={yearOption.year} className={cardClassName}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {yearOption.year}
                  </Text>
                  <View className="rounded-full bg-green-500/15 px-2 py-0.5">
                    <Text
                      className="text-xs text-green-600 dark:text-green-400"
                      style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                    >
                      All Synced
                    </Text>
                  </View>
                </View>
              </View>
              <View className="mt-3 flex-row flex-wrap items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-sm text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {syncedCount} readings synced
                  </Text>
                </View>
                {totalVersions === 0 && !allHolidaysSynced && !allDayInfoSynced && (
                  <Text
                    className="text-muted dark:text-muted-dark text-sm"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    No content
                  </Text>
                )}
              </View>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={yearOption.year}
            onPress={() => onSelectYear(yearOption)}
            activeOpacity={0.7}
            className={cardClassName}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {yearOption.year}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#737373" : "#A3A3A3"}
              />
            </View>
            <View className="mt-3 flex-row flex-wrap items-center gap-3">
              {syncedCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-sm text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {syncedCount} readings synced
                  </Text>
                </View>
              )}
              {availableCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="arrow-down-circle" size={14} color="#3b82f6" />
                  <Text
                    className="text-primary text-sm"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {availableCount} available
                  </Text>
                </View>
              )}
              {!allHolidaysSynced && yearOption.languages.length > 0 && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="arrow-down-circle" size={14} color="#f59e0b" />
                  <Text
                    className="text-sm text-amber-600 dark:text-amber-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    holidays
                  </Text>
                </View>
              )}
              {!allDayInfoSynced && yearOption.languages.length > 0 && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="arrow-down-circle" size={14} color="#f59e0b" />
                  <Text
                    className="text-sm text-amber-600 dark:text-amber-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    day info
                  </Text>
                </View>
              )}
              {totalVersions === 0 && !allHolidaysSynced && !allDayInfoSynced && (
                <Text
                  className="text-muted dark:text-muted-dark text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  No content
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <View className="h-8" />
    </ScrollView>
  );
}

export default YearSelectionStep;
