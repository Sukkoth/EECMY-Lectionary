import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loaded, error] = useFonts({
    "Lora-Regular": require("../assets/fonts/Lora/Lora-Regular.ttf"),
    "Lora-Bold": require("../assets/fonts/Lora/Lora-Bold.ttf"),
    "Lora-Italic": require("../assets/fonts/Lora/Lora-Italic.ttf"),
    "Lora-BoldItalic": require("../assets/fonts/Lora/Lora-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
