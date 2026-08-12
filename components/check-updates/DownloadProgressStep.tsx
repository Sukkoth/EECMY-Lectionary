import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { YearOption } from "../../app/settings/check-updates/types";
import InfoRow from "./InfoRow";
import { useTranslation } from "@/lib/i18n";

type Props = {
  progress: number;
  year: YearOption;
  selectedVersionLabels: string[];
  isDark?: boolean;
};

function DownloadProgressStep({
  progress,
  year,
  selectedVersionLabels,
  isDark,
}: Props) {
  const { t } = useTranslation();
  const progressPercent = Math.round(progress);
  const statusText =
    progress < 10
      ? t("preparingDownload")
      : progress < 45
        ? t("downloadingReadingData")
        : progress < 75
          ? t("verifyingDataIntegrity")
          : progress < 95
            ? t("finalizing")
            : t("almostDone");

  const statusIcon =
    progress < 10
      ? "time-outline"
      : progress < 75
        ? "cloud-download-outline"
        : progress < 95
          ? "shield-checkmark-outline"
          : "checkmark-circle-outline";

  return (
    <View className="flex-1 justify-center">
      <View className="bg-surface dark:bg-surface-dark items-center rounded-2xl px-6 py-8">
        <View className="mb-4 items-center justify-center rounded-full bg-primary/10 p-5">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>

        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons
            name={statusIcon as any}
            size={16}
            color="#3b82f6"
          />
          <Text
            className="text-muted dark:text-muted-dark text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {statusText}
          </Text>
        </View>

        <Text
          className="my-1 text-3xl font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {progressPercent}%
        </Text>

        <View className="my-4 w-full">
          <View className="h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        <View className="mt-4 w-full border-t border-stone-200/80 pt-4 dark:border-stone-800/80">
          <InfoRow label={t("targetYear")} value={String(year.year)} />
          <InfoRow
            label={t("selectedPackages")}
            value={`${selectedVersionLabels.length}`}
          />
        </View>
      </View>
    </View>
  );
}

export default DownloadProgressStep;
