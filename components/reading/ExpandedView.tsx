import { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, Text, View } from "react-native";
import ReadingCard from "./ReadingCard";
import type { ReadingRow } from "@/lib/database";
import { useSettings } from "@/lib/SettingsContext";
import { getReadingFontFamily } from "@/lib/settings";

import VersionBadge from "./VersionBadge";

const SECTION_LABELS: Record<string, string> = {
  OLD_TESTAMENT: "Old Testament",
  EPISTLE: "Epistle",
  GOSPEL: "Gospel",
};

type ExpandedViewProps = {
  date: string;
  readings: ReadingRow[];
  dayInfo?: { title: string | null; description: string | null } | null;
  fontSize: number;
  align: "left" | "center" | "justify";
  targetOrder?: number;
};

export default function ExpandedView({
  date,
  readings,
  dayInfo,
  fontSize,
  align,
  targetOrder,
}: ExpandedViewProps) {
  const { settings } = useSettings();
  const fontFamily = getReadingFontFamily(settings.readingFontFamily);
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

  const hasDayInfo = Boolean(dayInfo && (dayInfo.title || dayInfo.description));

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {hasDayInfo && (
        <View className="items-center px-4 pt-2">
          {dayInfo?.title && (
            <Text
              className="my-2 text-center text-xl leading-relaxed text-muted dark:text-muted-dark"
              style={{ fontFamily, fontWeight: "600" }}
            >
              {dayInfo.title}
            </Text>
          )}
          {dayInfo?.description && (
            <Text
              className="text-center text-[24px] text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily, fontWeight: "600" }}
            >
              {dayInfo.description}
            </Text>
          )}
        </View>
      )}

      {/* Shared Translation Version Badge */}
      <View className="mb-6 mt-4 items-center px-6">
        <VersionBadge version={readings[0]?.version ?? settings.version} />
      </View>

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
