import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "./global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#171717" : "#ffffff",
          },
          headerTintColor: isDark ? "#ffffff" : "#000000",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reading" options={{ headerShown: true, title: "Reading" }} />
      </Stack>
    </>
  );
}
