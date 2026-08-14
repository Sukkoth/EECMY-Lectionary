import { View, Text, SafeAreaView } from "react-native";
import { router } from "expo-router";
import LanguagePickerContent from "@/components/reading/LanguagePickerContent";

export default function LanguageSelectionScreen() {

  const handleVersionSelect = () => {
    router.push("/onboarding/complete");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-warm dark:bg-bg-warm-dark">
      <View className="flex-1 pt-12">
        {/* Header */}
        <View className="mb-6 px-6">
          <Text
            className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Select Your Language
          </Text>
          <Text
            className="mt-2 text-center text-sm text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Choose your preferred Bible translation
          </Text>
        </View>

        {/* Language Picker */}
        <LanguagePickerContent onVersionSelect={handleVersionSelect} hideHeader />
      </View>
    </SafeAreaView>
  );
}
