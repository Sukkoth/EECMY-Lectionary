import { Text, View, useColorScheme, Pressable, Appearance } from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
      <Text
        className="mb-8 text-lg text-black dark:text-white"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
      >
        Settings
      </Text>

      <Pressable
        onPress={toggleTheme}
        className="rounded-xl bg-gray-200 px-6 py-3 active:opacity-80 dark:bg-gray-700"
      >
        <Text
          className="text-base text-black dark:text-white"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Switch to {isDark ? "Light" : "Dark"} Mode
        </Text>
      </Pressable>

      <Text
        className="mt-4 text-sm text-gray-500 dark:text-gray-400"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        Current: {colorScheme === "dark" ? "\u{1F319} Dark" : "\u{2600}\u{FE0F} Light"}
      </Text>
    </View>
  );
}
