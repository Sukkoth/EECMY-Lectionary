import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Appearance,
  type DimensionValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_READING, MOCK_STREAK } from "@/lib/types";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";

  const reading = MOCK_READING;
  const streak = MOCK_STREAK;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const progress = Math.min(Math.max(streak.current / streak.best, 0), 1);
  const progressPercent = `${Math.round(progress * 100)}%`;

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="mt-8 flex-1 px-6">
        {/* ═══ HEADER ═══ */}
        <View className="mb-7 mt-4 flex-row items-center justify-between">
          <Text
            className="text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "Lora-Bold" }}
          >
            Daily Readings
          </Text>
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2"
          >
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
          </TouchableOpacity>
        </View>

        {/* ═══ DATE CARD ═══ */}
        <View className="bg-surface dark:bg-surface-dark mb-7 flex-row items-center rounded-2xl px-4 py-3.5">
          <View className="bg-primary-dimmed rounded-lg p-2">
            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
          </View>
          <Text className="ml-3 text-base text-[#2D2A24] dark:text-[#E8E4DC]">
            {formatDate(reading.date)}
          </Text>
        </View>

        {/* ═══ DAILY READING CARD ═══ */}
        <View className="bg-surface dark:bg-surface-dark mb-7 flex-1 justify-center rounded-2xl px-6 py-8">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <Text
              className="text-center text-lg leading-[28px] text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "Lora-Regular" }}
            >
              {reading.passage}
            </Text>
          </ScrollView>
          <Text className="text-muted dark:text-muted-dark mt-6 text-center text-sm leading-tight">
            {reading.reference}
          </Text>
        </View>

        {/* ═══ READING STREAK CARD ═══ */}
        <View className="bg-surface dark:bg-surface-dark mb-8 rounded-2xl px-5 py-5">
          {/* Streak header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]">
                Reading Streak
              </Text>
              <Text className="text-muted dark:text-muted-dark mt-0.5 text-sm">
                Best record: {streak.best} days
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-primary text-3xl font-bold leading-tight"
                style={{ fontFamily: "Lora-Bold" }}
              >
                {streak.current}
              </Text>
              <Text className="text-muted dark:text-muted-dark text-xs">days</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: progressPercent as DimensionValue }}
            />
          </View>

          {/* Weekly indicators */}
          <View className="mt-4 flex-row justify-between">
            {streak.completedDays.map((completed, index) => (
              <View key={index} className="items-center">
                <View
                  className={`h-7 w-7 items-center justify-center rounded-lg ${
                    completed ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-muted dark:text-muted-dark mt-1.5 text-xs">
                  {DAY_LABELS[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
