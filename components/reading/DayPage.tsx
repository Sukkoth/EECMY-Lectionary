import { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { getReadingForDate, getMultiReadingForDate } from "../../data/mock_reading";
import ReadingPassage from "./ReadingPassage";
import ReadingFooter from "./ReadingFooter";
import ExpandedView from "./ExpandedView";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type DayPageProps = {
  date: Date;
};

export function DayPage({ date }: DayPageProps) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const singleReading = useMemo(() => getReadingForDate(y, m, d), [y, m, d]);
  const multiReading = useMemo(() => getMultiReadingForDate(y, m, d), [y, m, d]);

  if (multiReading) {
    return (
      <View className="flex-1" style={{ width: SCREEN_WIDTH }}>
        <ExpandedView readings={multiReading.readings} />
      </View>
    );
  }

  if (singleReading) {
    return (
      <View className="flex-1 justify-center px-8" style={{ width: SCREEN_WIDTH }}>
        <ReadingPassage text={singleReading.passage} />
        <ReadingFooter reference={singleReading.reference} />
      </View>
    );
  }

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
