import { View } from "react-native";
import LanguagePickerContent from "./LanguagePickerContent";
import FontAlignmentContent from "./FontAlignmentContent";

export default function ReadingSettingsContent() {
  return (
    <View>
      <LanguagePickerContent />
      <View className="mx-6 my-2 h-px bg-stone-200 dark:bg-stone-700" />
      <FontAlignmentContent compact />
    </View>
  );
}
