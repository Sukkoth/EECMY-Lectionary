import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onCheck: () => void;
};

function IdleStep({ onCheck }: Props) {
  return (
    <>
      <View className="bg-surface dark:bg-surface-dark mb-6 items-center rounded-2xl px-6 py-8">
        <View className="mb-4 rounded-full bg-green-500/10 p-4">
          <Ionicons name="cloud-download-outline" size={36} color="#16a34a" />
        </View>
        <Text
          className="text-center text-base text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
        >
          Check for the latest Bible readings data to download.
        </Text>
        <Text
          className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Select languages, versions, and years to keep your content current.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onCheck}
        activeOpacity={0.7}
        className="bg-primary flex-row items-center justify-center gap-2 rounded-xl py-4"
      >
        <Ionicons name="refresh-outline" size={20} color="white" />
        <Text
          className="text-center text-base text-white"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Check for Updates
        </Text>
      </TouchableOpacity>
    </>
  );
}

export default IdleStep;
