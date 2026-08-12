import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "@/lib/i18n";

const CURRENT_VERSION = "1.0.0";

export default function AppUpdateScreen() {
  const isDark = useColorScheme() === "dark";
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<"idle" | "uptodate" | "available">("idle");

  const handleCheck = () => {
    setChecking(true);
    setResult("idle");
    setTimeout(() => {
      setChecking(false);
      setResult("uptodate");
    }, 1500);
  };

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="mb-6 flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("appUpdate")}
          </Text>
        </View>

        {/* Current version card */}
        <View className="bg-surface dark:bg-surface-dark mb-6 items-center rounded-2xl px-6 py-8">
          <View className="mb-4 rounded-full bg-blue-500/10 p-4">
            <Ionicons name="phone-portrait-outline" size={36} color="#3b82f6" />
          </View>
          <Text
            className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            {t("currentVersion")}
          </Text>
          <Text
            className="mt-1 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {CURRENT_VERSION}
          </Text>
        </View>

        {/* Result area */}
        {result === "uptodate" && (
          <View className="mb-6 flex-row items-center gap-3 rounded-2xl bg-green-500/10 px-5 py-4">
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <Text
              className="flex-1 text-base text-green-600 dark:text-green-400"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              {t("youreUpToDate")}
            </Text>
          </View>
        )}

        {result === "available" && (
          <View className="mb-6 rounded-2xl bg-blue-500/10 px-5 py-4">
            <Text
              className="text-center text-base text-blue-600 dark:text-blue-400"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              {t("newVersionAvailable")}
            </Text>
          </View>
        )}

        {/* Check button */}
        <TouchableOpacity
          onPress={handleCheck}
          disabled={checking}
          activeOpacity={0.7}
          className="bg-primary flex-row items-center justify-center gap-2 rounded-xl py-4"
        >
          {checking ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text
                className="text-center text-base text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("checking")}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text
                className="text-center text-base text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {t("checkForUpdates")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
