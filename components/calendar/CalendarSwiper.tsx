import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { MonthPage } from "./MonthPage";
import type { HolidayIndex } from "@/lib/hooks/useHolidays";
import type { DayInfoIndex } from "@/lib/hooks/useDayInfo";
import type { CalendarStyle } from "@/lib/settings";

export function getOffsetMonth(
  curr: { year: number; month: number },
  delta: number,
  isEth: boolean,
): { year: number; month: number } {
  const totalMonths = isEth ? 13 : 12;
  const total = curr.month + delta;
  const newYear = curr.year + Math.floor(total / totalMonths);
  const newMonth = ((total % totalMonths) + totalMonths) % totalMonths;
  return { year: newYear, month: newMonth };
}

export type CalendarSwiperRef = {
  goToPrev: () => void;
  goToNext: () => void;
  jumpTo: (date: { year: number; month: number }) => void;
};

type CalendarSwiperProps = {
  initialDate: { year: number; month: number };
  isEth: boolean;
  holidayIndex?: HolidayIndex;
  dayInfoIndex?: DayInfoIndex;
  screenWidth: number;
  calendarStyle: CalendarStyle;
  showSeasonColors: boolean;
  onMonthChange: (year: number, month: number) => void;
  onOpenPicker?: (year: number, month: number) => void;
};

/**
 * High-Performance 3-Slot Carousel
 * Uses 3 stable virtual slots that wrap continuously with zero unmounting
 * and zero coordinate resets during swiping.
 */
export const CalendarSwiper = forwardRef<CalendarSwiperRef, CalendarSwiperProps>(
  function CalendarSwiper(
    {
      initialDate,
      isEth,
      holidayIndex,
      dayInfoIndex,
      screenWidth,
      calendarStyle,
      showSeasonColors,
      onMonthChange,
      onOpenPicker,
    },
    ref,
  ) {
    const [baseDate, setBaseDate] = useState(() => initialDate);
    const [vOffset, setVOffset] = useState(0);

    const sharedOffset = useSharedValue(0);
    const currentOffset = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    const onMonthChangeRef = useRef(onMonthChange);
    onMonthChangeRef.current = onMonthChange;

    const baseDateRef = useRef(baseDate);
    baseDateRef.current = baseDate;

    const onSettle = useCallback(
      (newTargetOffset: number) => {
        currentOffset.value = newTargetOffset;
        setVOffset(newTargetOffset);
        isAnimating.value = false;
        const targetDate = getOffsetMonth(baseDateRef.current, newTargetOffset, isEth);
        onMonthChangeRef.current(targetDate.year, targetDate.month);
      },
      [isEth, currentOffset, isAnimating],
    );

    useImperativeHandle(
      ref,
      () => ({
        goToPrev: () => {
          if (isAnimating.value) return;
          isAnimating.value = true;
          const target = currentOffset.value - 1;
          sharedOffset.value = withTiming(
            target,
            { duration: 180, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onSettle)(target);
            },
          );
        },
        goToNext: () => {
          if (isAnimating.value) return;
          isAnimating.value = true;
          const target = currentOffset.value + 1;
          sharedOffset.value = withTiming(
            target,
            { duration: 180, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onSettle)(target);
            },
          );
        },
        jumpTo: (targetDate: { year: number; month: number }) => {
          setBaseDate(targetDate);
          setVOffset(0);
          sharedOffset.value = 0;
          currentOffset.value = 0;
          isAnimating.value = false;
        },
      }),
      [onSettle, isAnimating, currentOffset, sharedOffset],
    );

    const panGesture = useMemo(() => {
      return Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-15, 15])
        .onUpdate((e) => {
          if (!isAnimating.value) {
            sharedOffset.value = currentOffset.value - e.translationX / screenWidth;
          }
        })
        .onEnd((e) => {
          if (isAnimating.value) return;
          const delta = sharedOffset.value - currentOffset.value;
          const velocity = -e.velocityX / screenWidth;

          let target = currentOffset.value;
          if (delta > 0.18 || velocity > 1.0) {
            target = currentOffset.value + 1;
          } else if (delta < -0.18 || velocity < -1.0) {
            target = currentOffset.value - 1;
          }

          isAnimating.value = true;
          sharedOffset.value = withTiming(
            target,
            { duration: 180, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onSettle)(target);
            },
          );
        });
    }, [screenWidth, onSettle, isAnimating, currentOffset, sharedOffset]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: -sharedOffset.value * screenWidth }],
    }));

    // Assign months to the 3 physical slots
    const slots = useMemo(() => {
      const k = vOffset;
      const slotIndices = [0, 1, 2];
      const activeOffsets = [k - 1, k, k + 1];

      return slotIndices.map((slotId) => {
        const offset = activeOffsets.find(
          (m) => ((m % 3) + 3) % 3 === slotId,
        )!;
        const monthData = getOffsetMonth(baseDate, offset, isEth);

        return {
          slotId,
          offset,
          monthData,
        };
      });
    }, [baseDate, vOffset, isEth]);

    return (
      <View style={{ flex: 1, width: screenWidth, overflow: "hidden" }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedContainerStyle]}>
            {slots.map(({ slotId, offset, monthData }) => {
              return (
                <View
                  key={`slot-${slotId}`}
                  style={{
                    position: "absolute",
                    left: offset * screenWidth,
                    width: screenWidth,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  <MonthPage
                    year={monthData.year}
                    month={monthData.month}
                    isEth={isEth}
                    holidayIndex={holidayIndex}
                    dayInfoIndex={dayInfoIndex}
                    screenWidth={screenWidth}
                    calendarStyle={calendarStyle}
                    showSeasonColors={showSeasonColors}
                    onOpenPicker={onOpenPicker}
                  />
                </View>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);
