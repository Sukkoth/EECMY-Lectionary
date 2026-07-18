import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { YearOption } from "../../app/settings/check-updates/types";
import InfoRow from "./InfoRow";

type Props = {
  progress: number;
  year: YearOption;
  selectedVersionLabels: string[];
  isDark: boolean;
};

function DownloadProgressStep({
  progress,
  year,
  selectedVersionLabels,
  isDark,
}: Props) {
  const progressPercent = Math.round(progress);
  const statusText =
    progress < 10
      ? "Preparing download…"
      : progress < 45
        ? "Downloading reading data…"
        : progress < 75
          ? "Verifying data integrity…"
          : progress < 95
            ? "Finalizing…"
            : "Almost done…";

  const statusIcon =
    progress < 10
      ? "time-outline"
      : progress < 75
        ? "download-outline"
        : progress < 95
          ? "shield-checkmark-outline"
          : "checkmark-circle-outline";

  return (
    <View className="flex-1 justify-center">
      <View className="bg-surface dark:bg-surface-dark rounded-2xl px-6 py-10">
        <View className="items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#E8E4DC" : "#2D2A24"}
            style={{ marginBottom: 20 }}
          />

          <View className="flex-row items-center gap-2">
            <Ionicons
              name={statusIcon as any}
              size={16}
              color={isDark ? "#8a8480" : "#6b6560"}
            />
            <Text
              className="text-muted dark:text-muted-dark text-sm"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {statusText}
            </Text>
          </View>
        </View>

        <View className="mt-6 mb-3 w-full">
          <View className="h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        <Text
          className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {progressPercent}%
        </Text>

        <View className="mt-6 w-full border-t border-stone-200 pt-4 dark:border-stone-700">
          <InfoRow label="Year" value={String(year.year)} />
          <InfoRow label="Size" value={year.size} />
          {selectedVersionLabels.length <= 6 && (
            <InfoRow
              label="Content"
              value={`${selectedVersionLabels.length} ${selectedVersionLabels.length === 1 ? "version" : "versions"}`}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default DownloadProgressStep;
