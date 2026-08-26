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
  cancelAnimation,
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

// Hoisted static styles — avoids creating new objects every render (rendering-hoist-jsx)
const CONTAINER_STYLE = { flex: 1, overflow: "hidden" as const, backgroundColor: "transparent" as const };
const ANIMATED_BASE_STYLE = { flex: 1, backgroundColor: "transparent" as const };
const SLOT_BASE_STYLE = {
  position: "absolute" as const,
  top: 0,
  bottom: 0,
  backgroundColor: "transparent" as const,
};

const TIMING_CHEVRON = { duration: 220, easing: Easing.out(Easing.cubic) };
const TIMING_SWIPE = { duration: 200, easing: Easing.out(Easing.quad) };

/**
 * 5-Slot Infinite Buffer Ring Carousel
 * Buffers 2 months behind and 2 months ahead so rapid/fast consecutive swipes
 * NEVER encounter empty space or visible component teleportation.
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
    const startOffset = useSharedValue(0);
    const currentOffset = useSharedValue(0);

    // Store callbacks in refs so the gesture/animation closures always
    // call the latest version without needing to recreate the gesture (rerender-use-ref-transient-values)
    const onMonthChangeRef = useRef(onMonthChange);
    onMonthChangeRef.current = onMonthChange;

    const baseDateRef = useRef(baseDate);
    baseDateRef.current = baseDate;

    const isEthRef = useRef(isEth);
    isEthRef.current = isEth;

    // Must be a shared value (not useRef) because it's read inside worklets
    const screenWidthSV = useSharedValue(screenWidth);
    screenWidthSV.value = screenWidth;

    const onSettle = useCallback(
      (newTargetOffset: number) => {
        currentOffset.value = newTargetOffset;
        setVOffset(newTargetOffset);
        const targetDate = getOffsetMonth(baseDateRef.current, newTargetOffset, isEthRef.current);
        onMonthChangeRef.current(targetDate.year, targetDate.month);
      },
      [currentOffset],
    );

    useImperativeHandle(
      ref,
      () => ({
        goToPrev: () => {
          cancelAnimation(sharedOffset);
          const target = Math.round(sharedOffset.value) - 1;
          currentOffset.value = target;
          sharedOffset.value = withTiming(
            target,
            TIMING_CHEVRON,
            (finished) => {
              if (finished) {
                runOnJS(onSettle)(target);
              }
            },
          );
        },
        goToNext: () => {
          cancelAnimation(sharedOffset);
          const target = Math.round(sharedOffset.value) + 1;
          currentOffset.value = target;
          sharedOffset.value = withTiming(
            target,
            TIMING_CHEVRON,
            (finished) => {
              if (finished) {
                runOnJS(onSettle)(target);
              }
            },
          );
        },
        jumpTo: (targetDate: { year: number; month: number }) => {
          cancelAnimation(sharedOffset);
          setBaseDate(targetDate);
          setVOffset(0);
          sharedOffset.value = 0;
          startOffset.value = 0;
          currentOffset.value = 0;
        },
      }),
      [onSettle, currentOffset, sharedOffset, startOffset],
    );

    // Gesture uses refs for dynamic values so the gesture object itself is stable
    // and doesn't need to be recreated when screenWidth/isEth/onSettle change
    const panGesture = useMemo(() => {
      return Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-8, 8])
        .onBegin(() => {
          cancelAnimation(sharedOffset);
          startOffset.value = sharedOffset.value;
        })
        .onUpdate((e) => {
          sharedOffset.value = startOffset.value - e.translationX / screenWidthSV.value;
        })
        .onEnd((e) => {
          const delta = sharedOffset.value - startOffset.value;
          const velocity = -e.velocityX / screenWidthSV.value;

          let target = Math.round(sharedOffset.value);
          if (delta > 0.15 || velocity > 0.5) {
            target = Math.floor(startOffset.value) + 1;
          } else if (delta < -0.15 || velocity < -0.5) {
            target = Math.ceil(startOffset.value) - 1;
          }

          currentOffset.value = target;
          sharedOffset.value = withTiming(
            target,
            TIMING_SWIPE,
            (finished) => {
              if (finished) {
                runOnJS(onSettle)(target);
              }
            },
          );
        });
    }, [onSettle, currentOffset, sharedOffset, startOffset]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: -sharedOffset.value * screenWidthSV.value }],
    }));

    // Container style with dynamic width
    const containerStyle = useMemo(
      () => ({ ...CONTAINER_STYLE, width: screenWidth }),
      [screenWidth],
    );

    // 5-Slot Infinite Buffer Ring: [k-2, k-1, k, k+1, k+2]
    const slots = useMemo(() => {
      const k = vOffset;
      const slotIndices = [0, 1, 2, 3, 4];
      const activeOffsets = [k - 2, k - 1, k, k + 1, k + 2];

      return slotIndices.map((slotId) => {
        const offset = activeOffsets.find(
          (m) => ((m % 5) + 5) % 5 === slotId,
        )!;
        const monthData = getOffsetMonth(baseDate, offset, isEth);

        return {
          slotId,
          offset,
          monthData,
        };
      });
    }, [baseDate, vOffset, isEth]);

    // Memoize slot position styles to avoid new objects each render
    const slotStyles = useMemo(
      () =>
        slots.map(({ offset }) => ({
          ...SLOT_BASE_STYLE,
          left: offset * screenWidth,
          width: screenWidth,
        })),
      [slots, screenWidth],
    );

    return (
      <View style={containerStyle}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            collapsable={false}
            style={[ANIMATED_BASE_STYLE, animatedContainerStyle]}
          >
            {slots.map(({ slotId, monthData }, index) => {
              return (
                <View
                  key={`slot-${slotId}`}
                  collapsable={false}
                  style={slotStyles[index]}
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
