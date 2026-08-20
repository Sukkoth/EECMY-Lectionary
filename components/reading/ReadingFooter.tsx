import { Share, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { useFavourites, useAddFavourite, useRemoveFavourite } from "@/lib/hooks/useFavourites";

import VersionBadge from "./VersionBadge";

type ReadingFooterProps = {
  date: string;
  order: number;
  reference: string;
  text: string;
  version: string;
};

export default function ReadingFooter({ date, order, reference, text, version }: ReadingFooterProps) {
  const { data: favourites = [] } = useFavourites();
  const addMut = useAddFavourite();
  const removeMut = useRemoveFavourite();
  const favourited = favourites.some((f) => f.date === date && f.order === order);

  const handleToggleFavourite = () => {
    if (favourited) {
      removeMut.mutate({ date, order });
    } else {
      addMut.mutate({ date, order });
    }
  };

  const handleShare = () => {
    Share.share({
      message: `${text}\n\n${reference} (${version.toUpperCase()})`,
    });
  };

  return (
    <View className="items-center">
      {/* Reference + Version */}
      <View className="items-center justify-center">
        <Text
          className="text-muted dark:text-muted-dark text-center text-xl mb-4"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {reference}
        </Text>
        <VersionBadge version={version} />
      </View>

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
