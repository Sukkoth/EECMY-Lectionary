import React, {
  forwardRef,
  useCallback,
  useEffect,
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

export function getMonthDifference(
  from: { year: number; month: number },
  to: { year: number; month: number },
  isEth: boolean,
): number {
  const totalMonths = isEth ? 13 : 12;
  return (to.year - from.year) * totalMonths + (to.month - from.month);
}

export type CalendarSwiperRef = {
  goToPrev: () => void;
  goToNext: () => void;
};

type CalendarSwiperProps = {
  current: { year: number; month: number };
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
 * 3-Slot Virtual Ring Carousel
 *
 * Slots continuously wrap without ever resetting `translateX` coordinates,
 * eliminating the visual flash and updating header state instantly upon release.
 */
export const CalendarSwiper = forwardRef<CalendarSwiperRef, CalendarSwiperProps>(
  function CalendarSwiper(
    {
      current,
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
    const [baseDate, setBaseDate] = useState(() => current);
    const [monthOffset, setMonthOffset] = useState(0);

    const sharedOffset = useSharedValue(0);
    const currentOffset = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    const onMonthChangeRef = useRef(onMonthChange);
    onMonthChangeRef.current = onMonthChange;

    const baseDateRef = useRef(baseDate);
    baseDateRef.current = baseDate;

    // Reset carousel base when calendar style toggles (Ethiopian <-> Gregorian)
    useEffect(() => {
      setBaseDate(current);
      setMonthOffset(0);
      sharedOffset.value = 0;
      currentOffset.value = 0;
      isAnimating.value = false;
    }, [isEth]);

    // Handle external month jumps (e.g. MonthYearPickerModal or "Today" button)
    useEffect(() => {
      const activeMonth = getOffsetMonth(baseDate, monthOffset, isEth);
      if (current.year !== activeMonth.year || current.month !== activeMonth.month) {
        const diff = getMonthDifference(baseDate, current, isEth);
        setMonthOffset(diff);
        sharedOffset.value = diff;
        currentOffset.value = diff;
        isAnimating.value = false;
      }
    }, [current, baseDate, monthOffset, isEth, sharedOffset, currentOffset, isAnimating]);

    // Instantly notify the parent header as soon as the swipe gesture decides its target
    const notifyTargetMonth = useCallback(
      (target: number) => {
        setMonthOffset(target);
        const targetDate = getOffsetMonth(baseDateRef.current, target, isEth);
        onMonthChangeRef.current(targetDate.year, targetDate.month);
      },
      [isEth],
    );

    const onAnimationFinish = useCallback(
      (newTargetOffset: number) => {
        currentOffset.value = newTargetOffset;
        isAnimating.value = false;
      },
      [currentOffset, isAnimating],
    );

    useImperativeHandle(
      ref,
      () => ({
        goToPrev: () => {
          if (isAnimating.value) return;
          isAnimating.value = true;
          const target = currentOffset.value - 1;
          notifyTargetMonth(target);
          sharedOffset.value = withTiming(
            target,
            { duration: 200, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onAnimationFinish)(target);
            },
          );
        },
        goToNext: () => {
          if (isAnimating.value) return;
          isAnimating.value = true;
          const target = currentOffset.value + 1;
          notifyTargetMonth(target);
          sharedOffset.value = withTiming(
            target,
            { duration: 200, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onAnimationFinish)(target);
            },
          );
        },
      }),
      [notifyTargetMonth, onAnimationFinish, isAnimating, currentOffset, sharedOffset],
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
          if (delta > 0.2 || velocity > 1.0) {
            target = currentOffset.value + 1;
          } else if (delta < -0.2 || velocity < -1.0) {
            target = currentOffset.value - 1;
          }

          if (target !== currentOffset.value) {
            runOnJS(notifyTargetMonth)(target);
          }

          isAnimating.value = true;
          sharedOffset.value = withTiming(
            target,
            { duration: 200, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(onAnimationFinish)(target);
            },
          );
        });
    }, [screenWidth, notifyTargetMonth, onAnimationFinish, isAnimating, currentOffset, sharedOffset]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: -sharedOffset.value * screenWidth }],
    }));

    // Generate month data and positions for the 3 slots around the current monthOffset
    const slots = useMemo(() => {
      const k = monthOffset;
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
    }, [baseDate, monthOffset, isEth]);

    return (
      <View style={{ flex: 1, width: screenWidth, overflow: "hidden" }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedContainerStyle]}>
            {slots.map(({ slotId, offset, monthData }) => {
              return (
                <View
                  key={`slot-${slotId}-${monthData.year}-${monthData.month}-${isEth ? "eth" : "gc"}`}
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
