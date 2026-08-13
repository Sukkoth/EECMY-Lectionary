import { Share, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import type { ReadingRow } from "@/lib/database";
import {
  useFavourites,
  useAddFavourite,
  useRemoveFavourite,
} from "@/lib/hooks/useFavourites";
import { FormattedText, stripFormattedTags } from "@/lib/formatText";

type ReadingCardProps = {
  date: string;
  reading: ReadingRow;
  sectionLabel: string;
  fontSize: number;
  align: "left" | "center" | "justify";
};

export default function ReadingCard({
  date,
  reading,
  sectionLabel,
  fontSize,
  align,
}: ReadingCardProps) {
  const { data: favourites = [] } = useFavourites();
  const addMut = useAddFavourite();
  const removeMut = useRemoveFavourite();
  const favourited = favourites.some(
    (f) => f.date === date && f.order === reading.order,
  );

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
      {/* Header section label & reference */}
      <View className="mb-3">
        <Text
          className="text-muted dark:text-muted-dark text-xs uppercase tracking-widest"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {sectionLabel}
        </Text>
        <Text
          className="text-primary text-[25px]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {reading.reference}
        </Text>
      </View>

      {/* Verse text */}
      <FormattedText
        text={reading.text}
        fontSize={fontSize}
        className="text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{
          fontFamily: "ReadingFont",
          fontWeight: "400",
          fontSize,
          textAlign: align,
          lineHeight: fontSize * 1.75,
        }}
      />

      {/* Centered Actions row at the end of the content */}
      <View className="mt-5 flex-row items-center justify-center gap-8">
        <TouchableOpacity
          onPress={handleToggleFavourite}
          activeOpacity={0.7}
          className="items-center"
        >
          <Ionicons
            name={favourited ? "star" : "star-outline"}
            size={24}
            color="#3b82f6"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          className="items-center"
        >
          <Octicons name="share-android" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
