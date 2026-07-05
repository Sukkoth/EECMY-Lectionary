import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ReadingFooterProps = {
  reference: string;
};

export default function ReadingFooter({ reference }: ReadingFooterProps) {
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
        <TouchableOpacity activeOpacity={0.7} className="items-center">
          <Ionicons name="star-outline" size={26} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} className="items-center">
          <Ionicons name="share-outline" size={26} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
