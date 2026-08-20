import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Manifest, YearOption } from "@/lib/types/checkUpdates";
import { useTranslation } from "@/lib/i18n";

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

function YearSelectionStep({
  manifest,
  onSelectYear,
  downloadedYears = [],
  syncedReadingCounts = {},
  syncedLangPackVersions = [],
  syncedReadingVersions = [],
  isDark,
}: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="mb-5">
        <Text
          className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("selectDataYear")}
        </Text>
        <Text
          className="text-muted dark:text-muted-dark mt-0.5 text-sm"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {t("chooseLiturgicalYear")}
        </Text>
      </View>

      {manifest.years.map((yearOption) => {
        let syncedVersionCount = 0;
        let updateVersionCount = 0;
        let newAvailableCount = 0;

        yearOption.languages.forEach((lang) => {
          lang.versions.forEach((ver) => {
            const record = syncedReadingVersions.find(
              (r) =>
                r.year === yearOption.year &&
                r.language.toLowerCase() === lang.code.toLowerCase() &&
                r.version.toLowerCase() === ver.code.toLowerCase(),
            );
            if (!record) {
              newAvailableCount++;
            } else if (record.contentVersion < ver.contentVersion) {
              updateVersionCount++;
            } else {
              syncedVersionCount++;
            }
          });
        });

        const allReadingsSynced =
          yearOption.languages.every((lang) =>
            lang.versions.every((ver) => {
              const record = syncedReadingVersions.find(
                (r) =>
                  r.year === yearOption.year &&
                  r.language.toLowerCase() === lang.code.toLowerCase() &&
                  r.version.toLowerCase() === ver.code.toLowerCase(),
              );
              return !!record && record.contentVersion >= ver.contentVersion;
            }),
          );

        const allHolidaysSynced = yearOption.languages.every((lang) => {
          if (!lang.holidays || lang.holidays.version <= 0) return true;
          const record = syncedLangPackVersions.find(
            (r) =>
              r.year === yearOption.year &&
              r.language.toLowerCase() === lang.code.toLowerCase() &&
              r.type === "holidays",
          );
          return !!record && record.contentVersion >= lang.holidays.version;
        });

        const allDayInfoSynced = yearOption.languages.every((lang) => {
          if (!lang.dayInfo || lang.dayInfo.version <= 0) return true;
          const record = syncedLangPackVersions.find(
            (r) =>
              r.year === yearOption.year &&
              r.language.toLowerCase() === lang.code.toLowerCase() &&
              r.type === "day-info",
          );
          return !!record && record.contentVersion >= lang.dayInfo.version;
        });

        const allSynced =
          allReadingsSynced && allHolidaysSynced && allDayInfoSynced;

        return (
          <TouchableOpacity
            key={yearOption.year}
            onPress={() => onSelectYear(yearOption)}
            activeOpacity={0.7}
            className={`bg-surface dark:bg-surface-dark mb-4 rounded-2xl border p-5 ${
              allSynced ? "border-green-500/30" : "border-transparent"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="rounded-xl bg-primary/10 p-2.5">
                  <Ionicons name="calendar" size={20} color="#3b82f6" />
                </View>
                <Text
                  className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {yearOption.year}
                </Text>
              </View>

              {allSynced ? (
                <View className="flex-row items-center gap-1 rounded-full bg-green-500/15 px-3 py-1">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text
                    className="text-xs text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {t("allSynced")}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
                  <Ionicons name="cloud-download-outline" size={14} color="#3b82f6" />
                  <Text
                    className="text-primary text-xs"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    {t("selectYear")}
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-4 flex-row flex-wrap items-center gap-2 border-t border-stone-200/60 pt-3 dark:border-stone-800/60">
              {syncedVersionCount > 0 && (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1">
                  <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
                  <Text
                    className="text-xs text-green-600 dark:text-green-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {syncedVersionCount} {t("synced")}
                  </Text>
                </View>
              )}
              {updateVersionCount > 0 && (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1">
                  <Ionicons name="arrow-up-circle" size={13} color="#d97706" />
                  <Text
                    className="text-xs text-amber-600 dark:text-amber-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {updateVersionCount} {t("updateAvailable")}
                  </Text>
                </View>
              )}
              {newAvailableCount > 0 && (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1">
                  <Ionicons name="arrow-down-circle" size={13} color="#3b82f6" />
                  <Text
                    className="text-primary text-xs"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {newAvailableCount} {t("available")}
                  </Text>
                </View>
              )}
              {(!allHolidaysSynced || !allDayInfoSynced) && yearOption.languages.length > 0 && (
                <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1">
                  <Ionicons name="calendar-outline" size={13} color="#d97706" />
                  <Text
                    className="text-xs text-amber-600 dark:text-amber-400"
                    style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                  >
                    {t("liturgicalDataUpdate")}
                  </Text>
                </View>
              )}
              {syncedVersionCount === 0 && updateVersionCount === 0 && newAvailableCount === 0 && (
                <Text
                  className="text-muted dark:text-muted-dark text-xs"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {t("noContentPackageAvailable")}
                </Text>
              )}
            </View>

            <View className="mt-3 flex-row items-center justify-end gap-1">
              <Text
                className="text-muted dark:text-muted-dark text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {yearOption.languages.length} {t("languagesAvailable")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDark ? "#8a8480" : "#6b6560"}
              />
            </View>
          </TouchableOpacity>
        );
      })}

      <View className="h-8" />
    </ScrollView>
  );
}

export default YearSelectionStep;

