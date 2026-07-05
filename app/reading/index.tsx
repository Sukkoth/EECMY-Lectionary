import { useMemo } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getReadingForDate } from "./_data";
import { ReadingHeader } from "./_components/ReadingHeader";
import { ReadingPassage } from "./_components/ReadingPassage";
import { ReadingFooter } from "./_components/ReadingFooter";

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    year?: string;
    month?: string;
    day?: string;
  }>();

  const reading = useMemo(() => {
    if (params.year && params.month && params.day) {
      return getReadingForDate(
        parseInt(params.year, 10),
        parseInt(params.month, 10),
        parseInt(params.day, 10),
      );
    }
    return null;
  }, [params.year, params.month, params.day]);

  const weekday = reading ? reading.date.toLocaleDateString("en-US", { weekday: "long" }) : "";
  const formattedDate = reading
    ? reading.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "";
  const season = reading?.season ?? "";

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ReadingHeader
        weekday={weekday}
        formattedDate={formattedDate}
        season={season}
        onClose={() => router.back()}
      />

      <View className="flex-1 justify-center px-8">
        {reading ? (
          <>
            <ReadingPassage text={reading.passage} />
            <ReadingFooter reference={reading.reference} />
          </>
        ) : (
          <Text
            className="text-muted dark:text-muted-dark text-center"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Reading not found for this date
          </Text>
        )}
      </View>
    </View>
  );
}
