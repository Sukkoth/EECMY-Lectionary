import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type ReadingHeaderProps = {
  weekday: string;
  formattedDate: string;
  season: string;
  onClose: () => void;
};

export default function ReadingHeader({
  weekday,
  formattedDate,
  season,
  onClose,
}: ReadingHeaderProps) {
  return (
    <View className="border-b border-stone-200 px-6 pb-4 pt-10 dark:border-stone-800">
      <View className="flex-row items-start justify-between">
        {/* Left: weekday + date + season */}
        <View className="flex-1">
          <Text
            className="text-[22px] leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {weekday}, {formattedDate}
          </Text>
          {season ? (
            <Text
              className="text-muted dark:text-muted-dark mt-0.5 text-xs uppercase tracking-widest"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {season}
            </Text>
          ) : null}
        </View>

        {/* Right: settings + close */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="settings-outline" size={20} color="#6B6560" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="close" size={20} color="#6B6560" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
