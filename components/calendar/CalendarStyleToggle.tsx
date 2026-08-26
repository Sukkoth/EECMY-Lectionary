import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type CalendarStyleToggleProps = {
  isEth: boolean;
  onToggle: (style: "ethiopian" | "gregorian") => void;
  ethiopianLabel: string;
  gregorianLabel: string;
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 220,
  mass: 0.8,
};

export function CalendarStyleToggle({
  isEth,
  onToggle,
  ethiopianLabel,
  gregorianLabel,
}: CalendarStyleToggleProps) {
  const ethLayout = useRef({ x: 2, width: 0 });
  const gcLayout = useRef({ x: 0, width: 0 });
  const hasInitialized = useRef(false);

  const indicatorX = useSharedValue(2);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  const updateIndicator = useCallback(
    (animate: boolean) => {
      const target = isEth ? ethLayout.current : gcLayout.current;
      if (target.width === 0) return;

      if (!animate) {
        indicatorX.value = target.x;
        indicatorWidth.value = target.width;
        indicatorOpacity.value = 1;
      } else {
        indicatorX.value = withSpring(target.x, SPRING_CONFIG);
        indicatorWidth.value = withSpring(target.width, SPRING_CONFIG);
        indicatorOpacity.value = 1;
      }
    },
    [isEth, indicatorX, indicatorWidth, indicatorOpacity],
  );

  useEffect(() => {
    if (hasInitialized.current) {
      updateIndicator(true);
    }
  }, [isEth, updateIndicator]);

  const handleEthLayout = (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    ethLayout.current = { x, width };
    if (isEth) {
      const shouldAnimate = hasInitialized.current;
      updateIndicator(shouldAnimate);
      hasInitialized.current = true;
    }
  };

  const handleGcLayout = (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    gcLayout.current = { x, width };
    if (!isEth) {
      const shouldAnimate = hasInitialized.current;
      updateIndicator(shouldAnimate);
      hasInitialized.current = true;
    }
  };

  const handlePress = (style: "ethiopian" | "gregorian") => {
    const switching = (style === "ethiopian") !== isEth;
    if (switching) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onToggle(style);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    opacity: indicatorOpacity.value,
  }));

  return (
    <View className="bg-stone-200/60 dark:bg-stone-800/60 flex-row items-center rounded-full p-0.5 h-9 border border-stone-200/60 dark:border-stone-800/60 relative overflow-hidden">
      {/* Sliding Active Pill Background */}
      <Animated.View
        pointerEvents="none"
        className="absolute top-0.5 bottom-0.5 bg-primary rounded-full"
        style={animatedIndicatorStyle}
      />

      {/* Ethiopian Option */}
      <TouchableOpacity
        onPress={() => handlePress("ethiopian")}
        onLayout={handleEthLayout}
        activeOpacity={0.8}
        className="h-full justify-center rounded-full px-3.5 z-10"
      >
        <Text
          className={`text-xs font-semibold ${
            isEth ? "text-white" : "text-muted dark:text-muted-dark"
          }`}
          style={{ fontFamily: "ReadingFont" }}
        >
          {isEth ? ethiopianLabel : "EC"}
        </Text>
      </TouchableOpacity>

      {/* Gregorian Option */}
      <TouchableOpacity
        onPress={() => handlePress("gregorian")}
        onLayout={handleGcLayout}
        activeOpacity={0.8}
        className="h-full justify-center rounded-full px-3.5 z-10"
      >
        <Text
          className={`text-xs font-semibold ${
            !isEth ? "text-white" : "text-muted dark:text-muted-dark"
          }`}
          style={{ fontFamily: "ReadingFont" }}
        >
          {!isEth ? gregorianLabel : "GC"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
