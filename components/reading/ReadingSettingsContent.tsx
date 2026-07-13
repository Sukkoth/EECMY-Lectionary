import { View } from "react-native";
import LanguagePickerContent from "./LanguagePickerContent";
import FontAlignmentContent from "./FontAlignmentContent";

type ReadingSettingsContentProps = {
  viewType: "simple" | "expanded";
};

export default function ReadingSettingsContent({ viewType }: ReadingSettingsContentProps) {
  return (
    <View>
      <LanguagePickerContent />
      <View className="my-5" />
      <FontAlignmentContent viewType={viewType} />
    </View>
  );
}
