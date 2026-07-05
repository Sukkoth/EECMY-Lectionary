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
          headerShown: false, // ❌ No navigation headers — all screens use custom headers
          contentStyle: {
            backgroundColor: isDark ? "#11100E" : "#F8F6F3",
          },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="reading" />
      </Stack>
    </>
  );
}
