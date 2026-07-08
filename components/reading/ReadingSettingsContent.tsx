import { View } from "react-native";
import LanguagePickerContent from "./LanguagePickerContent";
import FontAlignmentContent from "./FontAlignmentContent";

export default function ReadingSettingsContent() {
  return (
    <View>
      <LanguagePickerContent />
      <View className="my-5" />
      <FontAlignmentContent compact />
    </View>
  );
}
