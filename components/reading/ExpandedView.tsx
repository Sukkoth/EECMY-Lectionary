import { ScrollView, View } from "react-native";
import ReadingCard from "./ReadingCard";
import type { ReadingEntry } from "@/lib/types";

type ExpandedViewProps = {
  readings: ReadingEntry[];
};

export default function ExpandedView({ readings }: ExpandedViewProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      {readings.map((reading, index) => (
        <View key={index} className={index < readings.length - 1 ? "mb-8" : ""}>
          <ReadingCard reading={reading} />
        </View>
      ))}
    </ScrollView>
  );
}
