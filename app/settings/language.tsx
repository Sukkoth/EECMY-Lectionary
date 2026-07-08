import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LanguagePickerContent from "@/components/reading/LanguagePickerContent";

export default function LanguageSettingsScreen() {
  const isDark = useColorScheme() === "dark";

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Header with back button */}
      <View className="border-b border-stone-200 px-6 pb-4 pt-10 dark:border-stone-800">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Language & Version
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <LanguagePickerContent />
      </ScrollView>
    </SafeAreaView>
  );
}
