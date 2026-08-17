import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";

export default function TabLayout() {
  const isDark = useIsDark();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: isDark ? "#11100E" : "#F8F6F3",
        },
        tabBarStyle: {
          backgroundColor: isDark ? "#171717" : "#ffffff",
          borderTopColor: isDark ? "#262626" : "#e5e5e5",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "ReadingFont",
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#737373" : "#a3a3a3",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("calendar"),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: t("favourites"),
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="glossary"
        options={{
          title: t("reference"),
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
