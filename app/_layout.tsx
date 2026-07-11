import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { setBackgroundColorAsync } from "expo-system-ui";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider, useSettings } from "@/lib/SettingsContext";
import { FavouriteProvider } from "@/lib/FavouriteContext";
import { ensureHolidaysLoaded } from "@/lib/HolidayCache";
import "./global.css";

SplashScreen.preventAutoHideAsync();

function HolidayDataLoader() {
  const db = useSQLiteContext();
  const { settings } = useSettings();

  useEffect(() => {
    ensureHolidaysLoaded(db, settings.language).catch((err) => {
      console.warn("[HolidayCache] Failed to load holidays:", err);
    });
  }, [db, settings.language]);

  return null;
}

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider
        databaseName={process.env.EXPO_PUBLIC_DB_FILE_NAME!}
        assetSource={{ assetId: require("../assets/db/readings.db") }}
      >
        <BottomSheetModalProvider>
          <SettingsProvider>
            <FavouriteProvider>
              <HolidayDataLoader />
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: isDark ? "#11100E" : "#F8F6F3",
                  },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="reading/index" />
                <Stack.Screen name="settings/language" />
                <Stack.Screen name="settings/font-alignment" />
                <Stack.Screen name="settings/check-updates" />
              </Stack>
            </FavouriteProvider>
          </SettingsProvider>
        </BottomSheetModalProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
