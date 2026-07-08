import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReadingRow } from "@/lib/database";

type ReadingCardProps = {
  reading: ReadingRow;
  sectionLabel: string;
  fontSize: number;
  align: "left" | "center" | "justify";
};

export default function ReadingCard({ reading, sectionLabel, fontSize, align }: ReadingCardProps) {
  return (
    <View className="px-6 py-5">
      {/* Header row: section (left) + actions (right) */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-muted dark:text-muted-dark text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {sectionLabel}
          </Text>
          <Text
            className="text-primary text-3xl"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {reading.reference}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="star-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verse text */}
      <Text
        className="text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "400", fontSize, textAlign: align, lineHeight: fontSize * 1.75 }}
      >
        {reading.text}
      </Text>
    </View>
  );
}
