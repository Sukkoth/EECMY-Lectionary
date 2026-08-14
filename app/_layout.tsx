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
import { SettingsProvider, useSettings } from "@/lib/SettingsContext";
import { OnboardingProvider, useOnboarding } from "@/lib/OnboardingContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "./global.css";

import { Lora_400Regular } from "@expo-google-fonts/lora";
import { Merriweather_400Regular } from "@expo-google-fonts/merriweather";
import { NotoSerifEthiopic_400Regular } from "@expo-google-fonts/noto-serif-ethiopic";
import { Bitter_400Regular } from "@expo-google-fonts/bitter";
import { CormorantGaramond_400Regular } from "@expo-google-fonts/cormorant-garamond";
import { Inter_400Regular } from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();


async function setupNotifications() {
  /** This is required to use notification, especially on android v8+ */
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
};

setupNotifications()

function AppContent() {
  const { settings } = useSettings();
  const colorScheme = useColorScheme();
  const isDark = settings?.theme ? settings.theme === "dark" : colorScheme === "dark";
  const { isOnboardingComplete, loading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const style = isDark ? "light" : "dark";
    const bgColor = isDark ? "#11100E" : "#F8F6F3";
    setStatusBarStyle(style, true);
    if (Platform.OS === "android") {
      setStatusBarBackgroundColor(bgColor, true);
    }
    setBackgroundColorAsync(bgColor).catch(() => {});
  }, [isDark]);

  useEffect(() => {
    if (loading) return;

    const inOnboardingGroup = segments[0] === "onboarding";

    if (!isOnboardingComplete && !inOnboardingGroup) {
      router.replace("/onboarding");
    } else if (isOnboardingComplete && inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [isOnboardingComplete, loading, segments]);

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
    <>
      <StatusBar style={isDark ? "light" : "dark"} animated={true} />
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

  const [loaded, error] = useFonts({
    // Playfair Display (variable font — all weights via fontWeight)
    ReadingFont: require("../assets/fonts/PlayfairDisplay/PlayfairDisplay-Variable.ttf"),
    Benaiah: require("../assets/fonts/Benaiah/Benaiah.otf"),
    AbyssinicaSIL: require("../assets/fonts/Abyssinica Sil/AbyssinicaSIL-Regular.ttf"),
    Lora: Lora_400Regular,
    Merriweather: Merriweather_400Regular,
    NotoSerifEthiopic: NotoSerifEthiopic_400Regular,
    Bitter: Bitter_400Regular,
    CormorantGaramond: CormorantGaramond_400Regular,
    Inter: Inter_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      const targetColor = isDark ? "#11100E" : "#F8F6F3";
      requestAnimationFrame(async () => {
        try {
          await setBackgroundColorAsync(targetColor);
          if (Platform.OS === "android") {
            setStatusBarBackgroundColor(targetColor);
          }
        } catch (err) {
          console.warn("Postponed System UI background color update:", err);
        }
      });
    }
  }, [loaded, error, isDark]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
