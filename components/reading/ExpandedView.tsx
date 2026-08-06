import { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, View } from "react-native";
import ReadingCard from "./ReadingCard";
import type { ReadingRow } from "@/lib/database";

const SECTION_LABELS: Record<string, string> = {
  OLD_TESTAMENT: "Old Testament",
  EPISTLE: "Epistle",
  GOSPEL: "Gospel",
};

type ExpandedViewProps = {
  date: string;
  readings: ReadingRow[];
  fontSize: number;
  align: "left" | "center" | "justify";
  targetOrder?: number;
};

export default function ExpandedView({
  date,
  readings,
  fontSize,
  align,
  targetOrder,
}: ExpandedViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<{ [order: number]: number }>({});
  const animatedY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (targetOrder != null) {
      const timer = setTimeout(() => {
        const targetY = layoutsRef.current[targetOrder];
        if (targetY != null && targetY > 0 && scrollViewRef.current) {
          animatedY.setValue(0);
          const listenerId = animatedY.addListener(({ value }) => {
            scrollViewRef.current?.scrollTo({ y: value, animated: false });
          });

          Animated.timing(animatedY, {
            toValue: targetY,
            duration: 700, // Smooth 700ms deliberate scroll glide
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start(() => {
            animatedY.removeListener(listenerId);
          });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [targetOrder, animatedY]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {readings.map((reading, index) => (
        <View
          key={`${reading.section}-${reading.order}`}
          onLayout={(e) => {
            layoutsRef.current[reading.order] = e.nativeEvent.layout.y;
          }}
          className={index < readings.length - 1 ? "mb-8" : ""}
        >
          <ReadingCard
            date={date}
            reading={reading}
            sectionLabel={SECTION_LABELS[reading.section] ?? reading.section}
            fontSize={fontSize}
            align={align}
          />
        </View>
      ))}
    </ScrollView>
  );
}
