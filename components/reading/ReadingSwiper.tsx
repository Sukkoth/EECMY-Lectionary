import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { DayPage } from "./DayPage";
import { toDateString, type DayData } from "@/lib/database";
import { HALF_WINDOW } from "@/lib/ReadingRepository";

type SwiperItem = {
  date: Date;
  dayData: DayData | null;
};

type ReadingSwiperProps = {
  data: SwiperItem[];
  initialIndex: number;
  onPageChange: (date: Date, position: number) => void;
  /** Increment to trigger a snap to center after window rebuild. */
  rebuildKey: number;
};

export function ReadingSwiper({ data, initialIndex, onPageChange, rebuildKey }: ReadingSwiperProps) {
  const pagerRef = useRef<PagerView>(null);

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const item = data[e.nativeEvent.position];
      onPageChange(item.date, e.nativeEvent.position);
    },
    [data, onPageChange],
  );

  // When the window is rebuilt, snap back to center without animation
  useEffect(() => {
    if (rebuildKey > 0 && pagerRef.current) {
      requestAnimationFrame(() => {
        pagerRef.current?.setPageWithoutAnimation(HALF_WINDOW);
      });
    }
  }, [rebuildKey]);

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={initialIndex}
      onPageSelected={handlePageSelected}
    >
      {data.map((item) => (
        <View key={toDateString(item.date)} style={{ flex: 1 }}>
          <DayPage date={item.date} dayData={item.dayData} />
        </View>
      ))}
    </PagerView>
  );
}
