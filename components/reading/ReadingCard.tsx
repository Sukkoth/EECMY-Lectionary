import { Share, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Octicons from '@expo/vector-icons/Octicons';
import type { ReadingRow } from "@/lib/database";
import { useFavourites, useAddFavourite, useRemoveFavourite } from "@/lib/hooks/useFavourites";
import { FormattedText, stripFormattedTags } from "@/lib/formatText";

type ReadingCardProps = {
  date: string;
  reading: ReadingRow;
  sectionLabel: string;
  fontSize: number;
  align: "left" | "center" | "justify";
};

export default function ReadingCard({ date, reading, sectionLabel, fontSize, align }: ReadingCardProps) {
  const { data: favourites = [] } = useFavourites();
  const addMut = useAddFavourite();
  const removeMut = useRemoveFavourite();
  const favourited = favourites.some((f) => f.date === date && f.order === reading.order);

  const handleToggleFavourite = () => {
    if (favourited) {
      removeMut.mutate({ date, order: reading.order });
    } else {
      addMut.mutate({ date, order: reading.order });
    }
  };

  const handleShare = () => {
    Share.share({
      message: `${stripFormattedTags(reading.text)}\n\n${reading.reference} (${reading.version.toUpperCase()})`,
    });
  };

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
          <TouchableOpacity onPress={handleToggleFavourite} activeOpacity={0.7}>
            <Ionicons name={favourited ? "star" : "star-outline"} size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
            <Octicons name="share-android" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verse text */}
      <FormattedText
        text={reading.text}
        fontSize={fontSize}
        className="text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "400", fontSize, textAlign: align, lineHeight: fontSize * 1.75 }}
      />
    </View>
  );
}
