import { useMemo } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getReadingForDate, getMultiReadingForDate } from "../../data/mock_reading";
import ReadingHeader from "./_components/ReadingHeader";
import ReadingPassage from "./_components/ReadingPassage";
import ReadingFooter from "./_components/ReadingFooter";
import ExpandedView from "./_components/ExpandedView";

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    year?: string;
    month?: string;
    day?: string;
    expanded?: string;
  }>();

  const isExpanded = params.expanded === "true";

  const y = params.year ? parseInt(params.year, 10) : 0;
  const m = params.month ? parseInt(params.month, 10) : 0;
  const d = params.day ? parseInt(params.day, 10) : 0;

  const singleReading = useMemo(
    () => (!isExpanded && y && m && d ? getReadingForDate(y, m, d) : null),
    [y, m, d, isExpanded],
  );

  const multiReading = useMemo(
    () => (isExpanded && y && m && d ? getMultiReadingForDate(y, m, d) : null),
    [y, m, d, isExpanded],
  );

  const hasData = isExpanded ? multiReading !== null : singleReading !== null;

  const dateForHeader = multiReading?.date ?? singleReading?.date ?? new Date();
  const season = multiReading?.season ?? singleReading?.season ?? "";

  const weekday = dateForHeader.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = dateForHeader.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        weekday={weekday}
        formattedDate={formattedDate}
        season={season}
        onClose={() => router.back()}
      />

      {!hasData ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-muted dark:text-muted-dark text-center"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {isExpanded ? "No readings found for this date" : "Reading not found for this date"}
          </Text>
        </View>
      ) : isExpanded && multiReading ? (
        <ExpandedView readings={multiReading.readings} />
      ) : singleReading ? (
        <View className="flex-1 justify-center px-8">
          <ReadingPassage text={singleReading.passage} />
          <ReadingFooter reference={singleReading.reference} />
        </View>
      ) : null}
    </View>
  );
}
