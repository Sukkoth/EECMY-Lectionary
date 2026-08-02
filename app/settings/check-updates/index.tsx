import { Text, TouchableOpacity, View, useColorScheme, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CheckUpdatesScreen() {
  const isDark = useColorScheme() === "dark";

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="mb-6 flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Check for Updates
          </Text>
        </View>

        {/* App Update Card */}
        <TouchableOpacity
          onPress={() => router.push("/settings/check-updates/app")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="rounded-lg p-2" style={{ backgroundColor: isDark ? "#3b82f620" : "#DBEAFE" }}>
              <Ionicons name="phone-portrait-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                App Update
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Check for new version of the app
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#737373" : "#A3A3A3"} />
        </TouchableOpacity>

        {/* Content Update Card */}
        <TouchableOpacity
          onPress={() => router.push("/settings/check-updates/content")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="rounded-lg p-2" style={{ backgroundColor: isDark ? "#16a34a20" : "#DCFCE7" }}>
              <Ionicons name="cloud-download-outline" size={20} color="#16a34a" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Content Update
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Download latest Bible readings data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#737373" : "#A3A3A3"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
