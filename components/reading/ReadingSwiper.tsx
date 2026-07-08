import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { DayPage } from "./DayPage";
import { toDateString, type DayData } from "@/lib/database";

type SwiperItem = {
  date: Date;
  dayData: DayData | null;
};

type ReadingSwiperProps = {
  data: SwiperItem[];
  initialIndex: number;
  onPageChange: (date: Date) => void;
};

export function ReadingSwiper({ data, initialIndex, onPageChange }: ReadingSwiperProps) {
  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={initialIndex}
      onPageSelected={(e) => onPageChange(data[e.nativeEvent.position].date)}
    >
      {data.map((item) => (
        <View key={toDateString(item.date)} style={{ flex: 1 }}>
          <DayPage date={item.date} dayData={item.dayData} />
        </View>
      ))}
    </PagerView>
  );
}
