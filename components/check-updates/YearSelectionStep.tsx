import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Manifest, YearOption } from "../../app/settings/check-updates/types";

type Props = {
  manifest: Manifest;
  onSelectYear: (year: YearOption) => void;
  downloadedYears?: number[];
  syncedReadingCounts?: Record<number, number>;
  isDark: boolean;
};

function YearSelectionStep({ manifest, onSelectYear, downloadedYears = [], syncedReadingCounts = {}, isDark }: Props) {
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
        const allSynced = totalVersions > 0 && syncedCount === totalVersions;

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
              <View className="mt-3 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-sm text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {syncedCount} synced
                  </Text>
                </View>
                {totalVersions === 0 && (
                  <Text
                    className="text-muted dark:text-muted-dark text-sm"
                    style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                  >
                    No versions
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
            <View className="mt-3 flex-row items-center gap-3">
              {syncedCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-sm text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {syncedCount} synced
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
              {totalVersions === 0 && (
                <Text
                  className="text-muted dark:text-muted-dark text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  No versions
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
