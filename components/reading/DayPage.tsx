import { ActivityIndicator, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { type DayData, toDateString } from "@/lib/database";
import { useSettings } from "@/lib/SettingsContext";
import { getReadingFontFamily } from "@/lib/settings";
import { gregorianToEthiopian } from "@/lib/ethiopianCalendar";
import ReadingPassage from "./ReadingPassage";
import ReadingFooter from "./ReadingFooter";
import ExpandedView from "./ExpandedView";
import { useTranslation } from "@/lib/i18n";

type DayPageProps = {
  date: Date;
  dayData: DayData | null;
  isLoading?: boolean;
  targetOrder?: number;
};

export function DayPage({ date, dayData, isLoading, targetOrder }: DayPageProps) {
  const { settings, availableLanguages } = useSettings();
  const { t } = useTranslation();
  const fontFamily = getReadingFontFamily(settings.readingFontFamily);
  const dateStr = toDateString(date);

  // If query is fetching or dayData is not loaded yet, show smooth inline spinner inside reader area
  if (isLoading || dayData === undefined) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // No readings available (only shown after query completes if DB is empty for this date)
  if (!dayData || dayData.readings.length === 0) {
    const ethYear = gregorianToEthiopian(date).year;
    const currentLang = availableLanguages.find(
      (l) => l.code.toLowerCase() === settings.language.toLowerCase(),
    );
    const currentVer = currentLang?.versions.find(
      (v) => v.code.toLowerCase() === settings.version.toLowerCase(),
    );
    const versionName = currentVer?.label ?? settings.version.toUpperCase();

    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="bg-stone-200/50 dark:bg-stone-800/50 rounded-full p-5 mb-5">
          <Ionicons name="book-outline" size={42} color="#857F72" />
        </View>
        <Text
          className="text-xl text-center font-semibold text-[#2D2A24] dark:text-[#E8E4DC] mb-3 px-2 leading-snug"
          style={{ fontFamily }}
        >
          {t("noReadingsForVersionAndYear")
            .replace("{version}", versionName)
            .replace("{year}", String(ethYear))}
        </Text>
        <Text
          className="text-muted dark:text-muted-dark text-center text-base leading-relaxed px-2"
          style={{ fontFamily, fontWeight: "400" }}
        >
          {t("noReadingsSwitchOrDownload")}
        </Text>
      </View>
    );
  }

  // Single reading — show passage + footer (with dayInfo on top if present)
  if (dayData.readings.length === 1) {
    const reading = dayData.readings[0];
    const hasDayInfo = Boolean(
      dayData.dayInfo && (dayData.dayInfo.title || dayData.dayInfo.description)
    );

    return (
      <View className="flex-1 justify-center px-8">
        {hasDayInfo && (
          <View className="mb-6 items-center px-4">
            {dayData.dayInfo?.title && (
              <Text
                className="mb-2 text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily, fontWeight: "600" }}
              >
                {dayData.dayInfo.title}
              </Text>
            )}
            {dayData.dayInfo?.description && (
              <Text
                className="text-center text-base leading-relaxed text-muted dark:text-muted-dark"
                style={{ fontFamily, fontWeight: "400" }}
              >
                {dayData.dayInfo.description}
              </Text>
            )}
          </View>
        )}
        <ReadingPassage
          text={reading.text}
          fontSize={settings.fontSizeSimple}
          align={settings.alignSimple}
        />
        <ReadingFooter
          date={dateStr}
          order={reading.order}
          reference={reading.reference}
          text={reading.text}
          version={reading.version}
        />
      </View>
    );
  }

  // Multiple readings — show expanded view
  return (
    <View className="flex-1">
      <ExpandedView
        date={dateStr}
        readings={dayData.readings}
        dayInfo={dayData.dayInfo}
        fontSize={settings.fontSizeExpanded}
        align={settings.alignExpanded}
        targetOrder={targetOrder}
      />
    </View>
  );
}
