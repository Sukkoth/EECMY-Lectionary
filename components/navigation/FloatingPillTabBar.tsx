import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsDark } from "@/lib/useIsDark";

function getTabIconName(
  routeName: string,
  isFocused: boolean,
): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case "index":
      return isFocused ? "home" : "home-outline";
    case "calendar":
      return isFocused ? "calendar" : "calendar-outline";
    case "favourites":
      return isFocused ? "heart" : "heart-outline";
    case "glossary":
      return isFocused ? "book" : "book-outline";
    case "notes":
      return isFocused ? "document-text" : "document-text-outline";
    case "settings":
      return isFocused ? "settings" : "settings-outline";
    default:
      return "ellipse-outline";
  }
}

export function FloatingPillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();

  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8);

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomInset + 6,
        left: 20,
        right: 20,
        alignItems: "center",
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: 9999,
          backgroundColor: isDark ? "#1C1A17" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
          shadowColor: isDark ? "#000000" : "#2D2A24",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.45 : 0.1,
          shadowRadius: 14,
          elevation: 10,
          maxWidth: 380,
          width: "100%",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const iconName = getTabIconName(route.name, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 9999,
                backgroundColor: isFocused
                  ? isDark
                    ? "#3b82f6"
                    : "#3b82f6"
                  : "transparent",
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={
                  isFocused
                    ? "#FFFFFF"
                    : isDark
                      ? "#A8A29E"
                      : "#78716C"
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
