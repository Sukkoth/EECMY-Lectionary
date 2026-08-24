import { Stack } from "expo-router";

export default function CheckUpdatesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="content" />
    </Stack>
  );
}
