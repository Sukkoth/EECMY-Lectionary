import { useEffect } from "react";
import { View, Text, TouchableOpacity, useColorScheme, SafeAreaView } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function WelcomeScreen() {
  const isDark = useColorScheme() === "dark";

  const iconScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
  }, [iconScale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      <View className="flex-1 items-center justify-center px-8">
        {/* App Icon with entrance animation */}
        <Animated.View
          style={iconAnimatedStyle}
          className="mb-8 items-center"
        >
          <View
            className="h-28 w-28 items-center justify-center rounded-[2rem]"
            style={{
              backgroundColor: isDark ? "#3b82f618" : "#3b82f60d",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.12 : 0.06,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Ionicons name="book" size={56} color="#3b82f6" />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          entering={FadeInDown.delay(200).springify().damping(18)}
          className="mb-3 text-5xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "700" }}
        >
          YeiLet
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(350).springify().damping(18)}
          className="mb-2 text-center text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Daily Lectionary Readings
        </Animated.Text>

        {/* Expanded description */}
        <Animated.Text
          entering={FadeInDown.delay(480).springify().damping(18)}
          className="mb-10 text-center text-sm leading-6 text-muted dark:text-muted-dark"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          A companion for the Ethiopian Evangelical Church Mekane Yesus{"\n"}
          daily reading tradition — guiding you through yearly{"\n"}
          lectionary readings.
        </Animated.Text>

        {/* Divider with cross */}
        <Animated.View
          entering={FadeIn.delay(600)}
          className="mb-10 flex-row items-center gap-4"
        >
          <View className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          <Ionicons
            name="add"
            size={16}
            color={isDark ? "#8a8480" : "#6b6560"}
          />
          <View className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        </Animated.View>

        {/* Begin Your Journey Button */}
        <AnimatedTouchable
          onPress={() => router.push("/onboarding/features")}
          className="mb-4 w-full items-center rounded-2xl bg-primary py-4"
          activeOpacity={0.8}
          entering={FadeInDown.delay(700).springify().damping(18)}
        >
          <Text
            className="text-base font-semibold text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Begin Your Journey
          </Text>
        </AnimatedTouchable>

        {/* Skip Button */}
        <AnimatedTouchable
          onPress={() => router.push("/onboarding/language")}
          className="py-3"
          activeOpacity={0.7}
          entering={FadeIn.delay(850)}
        >
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Skip Tutorial
          </Text>
        </AnimatedTouchable>
      </View>
    </SafeAreaView>
  );
}
