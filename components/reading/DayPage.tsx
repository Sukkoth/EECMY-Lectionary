import { Text, View } from "react-native";
import { type DayData, toDateString } from "@/lib/database";
import { useSettings } from "@/lib/SettingsContext";
import ReadingPassage from "./ReadingPassage";
import ReadingFooter from "./ReadingFooter";
import ExpandedView from "./ExpandedView";

import { useTranslation } from "@/lib/i18n";

type DayPageProps = {
  date: Date;
  dayData: DayData | null;
  targetOrder?: number;
};

export function DayPage({ date, dayData, targetOrder }: DayPageProps) {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const dateStr = toDateString(date);

  // No readings available
  if (!dayData || dayData.readings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text
          className="text-muted dark:text-muted-dark text-center leading-relaxed"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {t("noReadings")}
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
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {dayData.dayInfo.title}
              </Text>
            )}
            {dayData.dayInfo?.description && (
              <Text
                className="text-center text-base leading-relaxed text-muted dark:text-muted-dark"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
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
