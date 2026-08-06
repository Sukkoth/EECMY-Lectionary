import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { DayPage } from "./DayPage";
import { toDateString, type DayData } from "@/lib/database";

const CENTER_INDEX = 2;

type SwiperItem = {
  date: Date;
  dayData: DayData | null;
};

type ReadingSwiperProps = {
  data: SwiperItem[];
  onPageChange: (date: Date, position: number) => void;
  rebuildKey: number;
  targetOrder?: number;
};

export function ReadingSwiper({ data, onPageChange, rebuildKey, targetOrder }: ReadingSwiperProps) {
  const pagerRef = useRef<PagerView>(null);

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const position = e.nativeEvent.position;
      if (position === CENTER_INDEX) return;
      const item = data[position];
      onPageChange(item.date, position);
    },
    [data, onPageChange],
  );

  useEffect(() => {
    if (rebuildKey > 0 && pagerRef.current) {
      requestAnimationFrame(() => {
        pagerRef.current?.setPageWithoutAnimation(CENTER_INDEX);
      });
    }
  }, [rebuildKey]);

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={CENTER_INDEX}
      onPageSelected={handlePageSelected}
    >
      {data.map((item, index) => (
        <View key={toDateString(item.date)} style={{ flex: 1 }}>
          <DayPage
            date={item.date}
            dayData={item.dayData}
            targetOrder={index === CENTER_INDEX ? targetOrder : undefined}
          />
        </View>
      ))}
    </PagerView>
  );
}
