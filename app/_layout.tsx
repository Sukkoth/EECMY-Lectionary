import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar, setStatusBarBackgroundColor } from "expo-status-bar";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { setBackgroundColorAsync } from "expo-system-ui";
import { SQLiteProvider } from "expo-sqlite";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider } from "@/lib/SettingsContext";
import { FavouriteProvider } from "@/lib/FavouriteContext";
import { OnboardingProvider, useOnboarding } from "@/lib/OnboardingContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "./global.css";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isOnboardingComplete, loading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inOnboardingGroup = segments[0] === "onboarding";

    if (!isOnboardingComplete && !inOnboardingGroup) {
      router.replace("/onboarding");
    } else if (isOnboardingComplete && inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [isOnboardingComplete, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#11100E" : "#F8F6F3" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        initialRouteName={isOnboardingComplete ? "(tabs)" : "onboarding"}
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
        <Stack.Screen name="glossary/lectionary" />
        <Stack.Screen name="glossary/church-year" />
        <Stack.Screen name="glossary/creeds" />
        <Stack.Screen name="glossary/lords-prayer" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    setBackgroundColorAsync(isDark ? "#11100E" : "#F8F6F3");
    setStatusBarBackgroundColor(isDark ? "#11100E" : "#F8F6F3");
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
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <SettingsProvider>
              <OnboardingProvider>
                <FavouriteProvider>
                  <AppContent />
                </FavouriteProvider>
              </OnboardingProvider>
            </SettingsProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
