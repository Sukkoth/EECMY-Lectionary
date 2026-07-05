import { useCallback } from "react";
import { Dimensions, FlatList, type ListRenderItem, type ViewToken } from "react-native";
import { DayPage } from "./DayPage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ReadingSwiperProps = {
  dates: Date[];
  initialIndex: number;
  onPageChange: (date: Date) => void;
};

export function ReadingSwiper({ dates, initialIndex, onPageChange }: ReadingSwiperProps) {
  const renderItem: ListRenderItem<Date> = useCallback(
    ({ item }) => <DayPage date={item} />,
    [],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        onPageChange(viewableItems[0].item as Date);
      }
    },
    [onPageChange],
  );

  return (
    <FlatList
      data={dates}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={initialIndex}
      renderItem={renderItem}
      keyExtractor={(item) => item.toISOString().split("T")[0]}
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
