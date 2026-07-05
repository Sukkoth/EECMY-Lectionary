import { ScrollView, Text, View, useColorScheme } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { Reading } from "@/lib/types";

export default function ReadingScreen() {
  const params = useLocalSearchParams<{ reading: string }>();

  let reading: Reading | null = null;
  try {
    reading = params.reading ? JSON.parse(params.reading) : null;
  } catch {
    reading = null;
  }

  if (!reading) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center">
        <Text
          className="text-muted dark:text-muted-dark"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Reading not found
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reading type badge */}
        <View className="mb-4 mt-6 px-6">
          <View className="bg-primary-dimmed self-start rounded-full px-4 py-1.5">
            <Text
              className="text-primary text-xs uppercase tracking-widest"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {reading.label}
            </Text>
          </View>
        </View>

        {/* Book + Chapter heading */}
        <View className="mb-6 px-6">
          <Text
            className="text-[32px] leading-[40px] text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {reading.book} {reading.chapter}
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-base"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {reading.chapter}:{reading.verseRange}
          </Text>
        </View>

        {/* Full text */}
        {reading.text ? (
          <View className="px-6">
            <Text
              className="text-[17px] leading-[28px] text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {reading.text}
            </Text>
          </View>
        ) : (
          <View className="px-6">
            <Text
              className="text-muted dark:text-muted-dark text-base italic leading-relaxed"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Full text for this reading will be available in a future update.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
