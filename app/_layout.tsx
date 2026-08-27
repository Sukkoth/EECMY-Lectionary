import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar, setStatusBarStyle, setStatusBarBackgroundColor } from "expo-status-bar";
import { useColorScheme, ActivityIndicator, View, Platform } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { setBackgroundColorAsync } from "expo-system-ui";
import { SQLiteProvider } from "expo-sqlite";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import {
  ThemeProvider,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { SettingsProvider } from "@/lib/SettingsContext";
import { OnboardingProvider, useOnboarding } from "@/lib/OnboardingContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useIsDark } from "@/lib/useIsDark";
import { useEvents } from "@/lib/hooks/useEvents";
import { useTags } from "@/lib/hooks/useTags";
import "./global.css";

import { Lora_400Regular } from "@expo-google-fonts/lora";
import { Merriweather_400Regular } from "@expo-google-fonts/merriweather";
import { NotoSerifEthiopic_400Regular } from "@expo-google-fonts/noto-serif-ethiopic";
import { Bitter_400Regular } from "@expo-google-fonts/bitter";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();

const customDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: "#11100E",
    card: "#181614",
    text: "#E8E4DC",
    border: "#2A2723",
  },
};

const customLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: "#F8F6F3",
    card: "#FFFFFF",
    text: "#2D2A24",
    border: "#E8E4DC",
  },
};

import { setupNotificationChannels } from "@/lib/NotificationService";

async function setupNotifications() {
  if (Platform.OS === "android") {
    await setupNotificationChannels().catch(() => {});
  }
}

setupNotifications();

function AppContent() {
  const isDark = useIsDark();
  const { setColorScheme } = useNativeWindColorScheme();
  const { isOnboardingComplete, loading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  // Pre-load custom events and tags into TanStack cache at app start
  useEvents();
  useTags();

  useEffect(() => {
    const style = isDark ? "light" : "dark";
    const bgColor = isDark ? "#11100E" : "#F8F6F3";

    setColorScheme(isDark ? "dark" : "light");
    setStatusBarStyle(style, false);
    if (Platform.OS === "android") {
      setStatusBarBackgroundColor(bgColor, false);
    }
    setBackgroundColorAsync(bgColor).catch(() => {});
  }, [isDark, setColorScheme]);

  useEffect(() => {
    if (loading) return;

    const inOnboardingGroup = segments[0] === "onboarding";

    if (!isOnboardingComplete && !inOnboardingGroup) {
      router.replace("/onboarding");
    }
  }, [isOnboardingComplete, loading, segments, router]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const targetUrl = response.notification.request.content.data?.url;
      if (targetUrl) {
        router.push(targetUrl as any);
      } else {
        router.push("/reading" as any);
      }
    });
    return () => subscription.remove();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#11100E" : "#F8F6F3" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? customDarkTheme : customLightTheme}>
      <StatusBar style={isDark ? "light" : "dark"} animated={false} />
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
        <Stack.Screen name="settings/about" />
        <Stack.Screen name="glossary/lectionary" />
        <Stack.Screen name="glossary/church-year" />
        <Stack.Screen name="glossary/creeds" />
        <Stack.Screen name="glossary/lords-prayer" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";

  const [loaded, error] = useFonts({
    // Inter for clean, formal UI typography
    ReadingFont: Inter_400Regular,
    Inter: Inter_400Regular,
    Inter_Medium: Inter_500Medium,
    Inter_SemiBold: Inter_600SemiBold,
    Inter_Bold: Inter_700Bold,
    Playfair: require("../assets/fonts/PlayfairDisplay/PlayfairDisplay-Variable.ttf"),
    Benaiah: require("../assets/fonts/Benaiah/Benaiah.otf"),
    AbyssinicaSIL: require("../assets/fonts/Abyssinica Sil/AbyssinicaSIL-Regular.ttf"),
    Lora: Lora_400Regular,
    Merriweather: Merriweather_400Regular,
    NotoSerifEthiopic: NotoSerifEthiopic_400Regular,
    Bitter: Bitter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#11100E" : "#F8F6F3" }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: isDark ? "#11100E" : "#F8F6F3" }}>
      <SQLiteProvider
        databaseName={process.env.EXPO_PUBLIC_DB_FILE_NAME || "lectionary-v1.db"}
        assetSource={{ assetId: require("../assets/db/readings.db") }}
      >
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <OnboardingProvider>
              <BottomSheetModalProvider>
                <AppContent />
              </BottomSheetModalProvider>
            </OnboardingProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
