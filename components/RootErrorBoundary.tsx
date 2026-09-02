import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type ErrorBoundaryProps } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsDark } from "@/lib/useIsDark";

export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const isDark = useIsDark();
  const [showDetails, setShowDetails] = useState(false);

  const handleGoHome = () => {
    try {
      router.replace("/");
    } catch {
      retry();
    }
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-6 py-8 items-center justify-center"
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Icon Box */}
        <View className="w-20 h-20 rounded-3xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 dark:border-red-500/30 items-center justify-center mb-5">
          <Ionicons
            name="warning-outline"
            size={40}
            color={isDark ? "#ef4444" : "#dc2626"}
          />
        </View>

        {/* Friendly Error Header */}
        <Text
          className="text-2xl font-bold text-center text-[#2D2A24] dark:text-[#E8E4DC] mb-2"
          style={{ fontFamily: "ReadingFont", fontWeight: "700" }}
          maxFontSizeMultiplier={1.3}
        >
          Something went wrong
        </Text>

        <Text
          className="text-base text-center text-muted dark:text-muted-dark leading-6 mb-8 max-w-[320px]"
          style={{ fontFamily: "ReadingFont" }}
          maxFontSizeMultiplier={1.3}
        >
          The application encountered an unexpected issue while rendering this screen.
        </Text>

        {/* Action Buttons */}
        <View className="w-full max-w-[320px] gap-3 mb-8">
          {/* Retry Button */}
          <TouchableOpacity
            onPress={retry}
            activeOpacity={0.8}
            className="bg-primary flex-row items-center justify-center gap-2 py-3.5 rounded-2xl shadow-sm"
          >
            <Ionicons name="refresh" size={18} color="#ffffff" />
            <Text className="text-white text-base font-semibold">Try Again</Text>
          </TouchableOpacity>

          {/* Go Home Button */}
          <TouchableOpacity
            onPress={handleGoHome}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark border border-stone-200/50 dark:border-stone-800/50 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
          >
            <Ionicons
              name="home-outline"
              size={18}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
            <Text className="text-[#2D2A24] dark:text-[#E8E4DC] text-base font-semibold">
              Return to Home
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Error Diagnostics */}
        <View className="w-full max-w-[340px]">
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-1.5 py-2"
          >
            <Text className="text-muted dark:text-muted-dark text-xs font-medium">
              {showDetails ? "Hide technical details" : "Show technical details"}
            </Text>
            <Ionicons
              name={showDetails ? "chevron-up" : "chevron-down"}
              size={14}
              color={isDark ? "#8a8480" : "#6b6560"}
            />
          </TouchableOpacity>

          {showDetails && (
            <View className="mt-2 p-3.5 rounded-xl bg-surface dark:bg-surface-dark border border-stone-200/50 dark:border-stone-800/50">
              <Text
                className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5 font-mono"
                selectable
              >
                {error?.name || "Error"}: {error?.message || "Unknown error"}
              </Text>
              {error?.stack ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text
                    className="text-[11px] leading-4 text-muted dark:text-muted-dark font-mono"
                    selectable
                  >
                    {error.stack}
                  </Text>
                </ScrollView>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
