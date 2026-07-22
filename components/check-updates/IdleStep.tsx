import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onCheck: () => void;
};

function IdleStep({ onCheck }: Props) {
  return (
    <>
      <View className="bg-surface dark:bg-surface-dark mb-6 rounded-2xl p-6">
        <View className="mb-6 mt-2 items-center">
          <View className="mb-4 items-center justify-center rounded-full bg-primary/10 p-5">
            <Ionicons name="cloud-download-outline" size={40} color="#3b82f6" />
          </View>
          <Text
            className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Content Update
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 px-2 text-center text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Download and sync offline Bible readings, liturgical calendar, and daily information.
          </Text>
        </View>

        <View className="border-t border-stone-200 pt-5 dark:border-stone-800">
          <View className="flex-row items-center gap-3.5">
            <View className="rounded-xl bg-primary/10 p-2.5">
              <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Annual Reading Plans
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Full year data for daily readings & liturgical seasons
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-3.5">
            <View className="rounded-xl bg-primary/10 p-2.5">
              <Ionicons name="language-outline" size={18} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Multi-Language Support
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Choose from available translations and content packs
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-3.5">
            <View className="rounded-xl bg-primary/10 p-2.5">
              <Ionicons name="flash-outline" size={18} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Offline Storage
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Saved locally on your device for instant offline access
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onCheck}
        activeOpacity={0.7}
        className="bg-primary flex-row items-center justify-center gap-2 rounded-xl py-4 shadow-sm"
      >
        <Ionicons name="refresh-outline" size={20} color="white" />
        <Text
          className="text-center text-base text-white"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Check for Available Updates
        </Text>
      </TouchableOpacity>
    </>
  );
}

export default IdleStep;

