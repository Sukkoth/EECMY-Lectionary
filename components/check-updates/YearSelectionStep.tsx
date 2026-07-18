import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Manifest, YearOption } from "../../app/settings/check-updates/types";

type Props = {
  manifest: Manifest;
  onSelectYear: (year: YearOption) => void;
  downloadedYears?: number[];
  isDark: boolean;
};

function YearSelectionStep({ manifest, onSelectYear, downloadedYears = [], isDark }: Props) {
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
        const langCount = yearOption.languages.length;
        const versionCount = yearOption.languages.reduce(
          (sum: number, l) => sum + l.versions.length,
          0,
        );
        const isDownloaded = downloadedYears.includes(yearOption.year);

        return (
          <TouchableOpacity
            key={yearOption.year}
            onPress={() => onSelectYear(yearOption)}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl px-5 py-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {yearOption.year}
                </Text>
                {isDownloaded && (
                  <View className="rounded-full bg-green-500/15 px-2 py-0.5">
                    <Text
                      className="text-xs text-green-600 dark:text-green-400"
                      style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                    >
                      Downloaded
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#737373" : "#A3A3A3"}
              />
            </View>

            <View className="mt-3 flex-row items-center gap-2">
              <Text
                className="text-primary text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {langCount} {langCount === 1 ? "language" : "languages"}
              </Text>
              <Text
                className="text-muted dark:text-muted-dark text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                ·
              </Text>
              <Text
                className="text-primary text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {versionCount} {versionCount === 1 ? "version" : "versions"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View className="h-8" />
    </ScrollView>
  );
}

export default YearSelectionStep;
