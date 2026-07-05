import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { setBackgroundColorAsync } from "expo-system-ui";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    setBackgroundColorAsync(isDark ? "#11100E" : "#F8F6F3");
  }, [isDark]);

  const [loaded, error] = useFonts({
    // Playfair Display (variable font — all weights via fontWeight)
    ReadingFont: require("../assets/fonts/PlayfairDisplay/PlayfairDisplay-Variable.ttf"),
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
          contentStyle: {
            backgroundColor: isDark ? "#11100E" : "#F8F6F3",
          },
          headerStyle: {
            backgroundColor: isDark ? "#171717" : "#ffffff",
          },
          headerTintColor: isDark ? "#ffffff" : "#000000",
          headerTitleStyle: {
            fontFamily: "ReadingFont",
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
