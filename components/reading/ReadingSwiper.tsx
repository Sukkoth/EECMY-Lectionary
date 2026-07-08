import { useCallback } from "react";
import { Dimensions, FlatList, type ListRenderItem, type ViewToken } from "react-native";
import { DayPage } from "./DayPage";
import type { DayData } from "@/lib/database";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const renderItem: ListRenderItem<SwiperItem> = useCallback(
    ({ item }) => <DayPage date={item.date} dayData={item.dayData} />,
    [],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        onPageChange((viewableItems[0].item as SwiperItem).date);
      }
    },
    [onPageChange],
  );

  return (
    <FlatList
      data={data}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={initialIndex}
      renderItem={renderItem}
      keyExtractor={(item) => item.date.toISOString().split("T")[0]}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      getItemLayout={(_, index) => ({
        length: SCREEN_WIDTH,
        offset: SCREEN_WIDTH * index,
        index,
      })}
    />
  );
}
