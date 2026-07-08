import { Dimensions, Text, View } from "react-native";
import type { DayData } from "@/lib/database";
import ReadingPassage from "./ReadingPassage";
import ReadingFooter from "./ReadingFooter";
import ExpandedView from "./ExpandedView";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type DayPageProps = {
  date: Date;
  dayData: DayData | null;
};

export function DayPage({ date, dayData }: DayPageProps) {
  // No readings available
  if (!dayData || dayData.readings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ width: SCREEN_WIDTH }}>
        <Text
          className="text-muted dark:text-muted-dark text-center leading-relaxed"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          No readings available for{" "}
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    );
  }

  // Single reading — show passage + footer
  if (dayData.readings.length === 1) {
    const reading = dayData.readings[0];
    return (
      <View className="flex-1 justify-center px-8" style={{ width: SCREEN_WIDTH }}>
        <ReadingPassage text={reading.text} />
        <ReadingFooter reference={reading.reference} />
      </View>
    );
  }

  // Multiple readings — show expanded view
  return (
    <View className="flex-1" style={{ width: SCREEN_WIDTH }}>
      <ExpandedView readings={dayData.readings} />
    </View>
  );
}
