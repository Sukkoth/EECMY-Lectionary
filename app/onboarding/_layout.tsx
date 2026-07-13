import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function OnboardingLayout() {
  const isDark = useColorScheme() === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? "#11100E" : "#F8F6F3",
        },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="features" />
      <Stack.Screen name="language" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
