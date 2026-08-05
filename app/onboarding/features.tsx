import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, useColorScheme, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";


const FEATURES = [
  {
    icon: "book-outline" as const,
    title: "Daily Readings",
    subtitle: "Read each day's appointed Scriptures",
    description:
      "Open the readings assigned for today from the EECMY lectionary. Each day brings together the passages appointed for worship throughout the church year.",
    highlight: "Daily readings",
  },
  {
    icon: "calendar-outline" as const,
    title: "Dual Calendar System",
    subtitle: "Ethiopian (EC) & Gregorian (GC)",
    description:
      "Seamlessly switch between Ethiopian (EC) and Gregorian (GC) calendars to follow daily readings, Sundays, and holy days in your preferred calendar system.",
    highlight: "Ethiopian (EC) • Gregorian (GC)",
  },
  {
    icon: "heart-outline" as const,
    title: "Save Readings",
    subtitle: "Keep passages close",
    description:
      "Bookmark readings that encourage, challenge, or inspire you, and return to them whenever you wish.",
    highlight: "Bookmarks",
  },
  {
    icon: "text-outline" as const,
    title: "Read Comfortably",
    subtitle: "Designed for daily reading",
    description:
      "Choose your preferred Bible translation, adjust the text size, and switch between light and dark mode for a comfortable reading experience.",
    highlight: "Bible version • Text size • Dark mode",
  },
  {
    icon: "library-outline" as const,
    title: "Learn More",
    subtitle: "Understand the tradition",
    description:
      "Discover the church year, read the historic creeds, and find the Lord's Prayer—all in one place alongside your daily readings.",
    highlight: "Church year • Creeds • Lord's Prayer",
  },
];


export default function FeaturesScreen() {
  const isDark = useColorScheme() === "dark";
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (currentPage < FEATURES.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      router.push("/onboarding/language");
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/language");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      {/* Skip Button */}
      <View className="absolute right-6 top-12 z-10">
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* PagerView */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {FEATURES.map((f, index) => (
          <View
            key={index}
            className="flex-1 items-center justify-center px-8"
          >
            {/* Icon */}
            <View
              className="mb-8 h-28 w-28 items-center justify-center rounded-[2rem]"
              style={{ backgroundColor: isDark ? "#3b82f618" : "#3b82f60d" }}
            >
              <Ionicons name={f.icon} size={56} color="#3b82f6" />
            </View>

            {/* Subtitle */}
            <Text
              className="mb-2 text-sm uppercase tracking-[0.2em] text-primary"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {f.subtitle}
            </Text>

            {/* Title */}
            <Text
              className="mb-5 text-3xl text-center text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {f.title}
            </Text>

            {/* Description */}
            <Text
              className="mb-6 text-center text-base leading-7 text-muted dark:text-muted-dark"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {f.description}
            </Text>

            {/* Feature pill */}
            <View
              className="rounded-full px-5 py-2"
              style={{ backgroundColor: isDark ? "#3b82f612" : "#3b82f608" }}
            >
              <Text
                className="text-xs text-primary"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {f.highlight}
              </Text>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Bottom Section */}
      <View className="px-8 pb-12">
        {/* Dot Indicators */}
        <View className="mb-6 flex-row items-center justify-center gap-2">
          {FEATURES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentPage
                  ? "w-7 bg-primary"
                  : "w-2 bg-stone-300 dark:bg-stone-600"
              }`}
            />
          ))}
        </View>

        {/* Next/Done Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="items-center rounded-2xl bg-primary py-4"
          activeOpacity={0.8}
        >
          <Text
            className="text-base font-semibold text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {currentPage === FEATURES.length - 1 ? "Choose Language" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
