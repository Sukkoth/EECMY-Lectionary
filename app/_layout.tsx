import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThemeProvider } from "@react-navigation/native";
import type { Theme } from "@react-navigation/native";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const LightNavigationTheme: Theme = {
  dark: false,
  colors: {
    primary: "#3b82f6",
    background: "#F8F6F3",
    card: "#F0EDE7",
    text: "#2D2A24",
    border: "#E8E4DC",
    notification: "#3b82f6",
  },
  fonts: {
    regular: { fontFamily: "ReadingFont", fontWeight: "400" },
    medium: { fontFamily: "ReadingFont", fontWeight: "500" },
    bold: { fontFamily: "ReadingFont", fontWeight: "600" },
    heavy: { fontFamily: "ReadingFont", fontWeight: "700" },
  },
};

const DarkNavigationTheme: Theme = {
  dark: true,
  colors: {
    primary: "#60A5FA",
    background: "#11100E",
    card: "#1A1815",
    text: "#E8E4DC",
    border: "#2A2724",
    notification: "#60A5FA",
  },
  fonts: {
    regular: { fontFamily: "ReadingFont", fontWeight: "400" },
    medium: { fontFamily: "ReadingFont", fontWeight: "500" },
    bold: { fontFamily: "ReadingFont", fontWeight: "600" },
    heavy: { fontFamily: "ReadingFont", fontWeight: "700" },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      <ThemeProvider value={isDark ? DarkNavigationTheme : LightNavigationTheme}>
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
      </ThemeProvider>
    </>
  );
}
