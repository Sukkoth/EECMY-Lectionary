import { Stack } from "expo-router";
import { useIsDark } from "@/lib/useIsDark";

export default function OnboardingLayout() {
  const isDark = useIsDark();

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
      <Stack.Screen name="notifications" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
