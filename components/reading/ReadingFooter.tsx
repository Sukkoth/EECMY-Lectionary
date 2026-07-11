import { useEffect, useState } from "react";
import { Share, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useFavourite } from "@/lib/FavouriteContext";
import { isFavourite as checkFavourite } from "@/lib/FavouriteRepository";

type ReadingFooterProps = {
  date: string;
  order: number;
  reference: string;
  text: string;
  version: string;
};

export default function ReadingFooter({ date, order, reference, text, version }: ReadingFooterProps) {
  const { addFavourite, removeFavourite, optimisticAdd, optimisticRemove } = useFavourite();
  const [favourited, setFavourited] = useState(() => checkFavourite(date, order));

  useEffect(() => {
    setFavourited(checkFavourite(date, order));
  }, [date, order]);

  const handleToggleFavourite = () => {
    if (favourited) {
      setFavourited(false);
      optimisticRemove(date, order);
      removeFavourite(date, order).catch(console.warn);
    } else {
      setFavourited(true);
      optimisticAdd(date, order);
      addFavourite(date, order).catch(console.warn);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `${text}\n\n${reference} (${version.toUpperCase()})`,
    });
  };

  return (
    <View className="items-center">
      {/* Reference */}
      <Text
        className="text-muted dark:text-muted-dark text-center text-sm"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {reference}
      </Text>

      {/* Favourite + Share */}
      <View className="mt-6 flex-row items-center gap-8">
        <TouchableOpacity onPress={handleToggleFavourite} activeOpacity={0.7} className="items-center">
          <Ionicons name={favourited ? "star" : "star-outline"} size={26} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7} className="items-center">
          <Octicons name="share-android" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
