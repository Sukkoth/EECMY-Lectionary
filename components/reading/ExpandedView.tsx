import { ScrollView, View } from "react-native";
import ReadingCard from "./ReadingCard";
import type { ReadingRow } from "@/lib/database";

const SECTION_LABELS: Record<string, string> = {
  OLD_TESTAMENT: "Old Testament",
  EPISTLE: "Epistle",
  GOSPEL: "Gospel",
};

type ExpandedViewProps = {
  readings: ReadingRow[];
  fontSize: number;
  align: "left" | "center" | "justify";
};

export default function ExpandedView({ readings, fontSize, align }: ExpandedViewProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      {readings.map((reading, index) => (
        <View key={`${reading.section}-${reading.order}`} className={index < readings.length - 1 ? "mb-8" : ""}>
          <ReadingCard reading={reading} sectionLabel={SECTION_LABELS[reading.section] ?? reading.section} fontSize={fontSize} align={align} />
        </View>
      ))}
    </ScrollView>
  );
}
