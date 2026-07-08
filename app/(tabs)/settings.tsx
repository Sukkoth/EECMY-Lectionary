import { Text, View, TouchableOpacity, useColorScheme, Pressable, Appearance, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { settings } = useSettings();

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6">
        {/* Title */}
        <Text
          className="mt-8 mb-8 text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Settings
        </Text>

        {/* Language & Version */}
        <TouchableOpacity
          onPress={() => router.push("/settings/language")}
          activeOpacity={0.7}
          className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary-dimmed rounded-lg p-2">
              <Ionicons name="language-outline" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Language & Version
              </Text>
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {settings.language === "en" ? "English" : "አማርኛ"} — {settings.version.toUpperCase()}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#737373" : "#A3A3A3"}
          />
        </TouchableOpacity>

        {/* Appearance */}
        <View className="bg-surface dark:bg-surface-dark rounded-2xl px-5 py-4">
          <Pressable
            onPress={toggleTheme}
            className="flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-4">
              <View className="rounded-lg p-2" style={{ backgroundColor: isDark ? "#3b82f620" : "#FEF3C7" }}>
                <Ionicons
                  name={isDark ? "moon-outline" : "sunny-outline"}
                  size={20}
                  color={isDark ? "#3b82f6" : "#D97706"}
                />
              </View>
              <Text
                className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Appearance
              </Text>
            </View>
            <Text
              className="text-muted dark:text-muted-dark text-sm capitalize"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {colorScheme === "dark" ? "Dark" : "Light"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
