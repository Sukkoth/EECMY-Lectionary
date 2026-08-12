import { View } from "react-native";
import LanguagePickerContent from "./LanguagePickerContent";
import FontAlignmentContent from "./FontAlignmentContent";

type ReadingSettingsContentProps = {
  viewType: "simple" | "expanded";
};

export default function ReadingSettingsContent({ viewType }: ReadingSettingsContentProps) {
  return (
    <View>
      <FontAlignmentContent viewType={viewType} />
      <View className="my-5" />
      <LanguagePickerContent />
    </View>
  );
}
