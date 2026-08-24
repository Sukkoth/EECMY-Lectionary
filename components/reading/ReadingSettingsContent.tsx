import { View } from "react-native";
import LanguagePickerContent from "./LanguagePickerContent";
import FontAlignmentContent from "./FontAlignmentContent";

type ReadingSettingsContentProps = {
  viewType: "simple" | "expanded";
  onVersionSelect?: () => void;
  activeDate?: Date;
};

export default function ReadingSettingsContent({
  viewType,
  onVersionSelect,
  activeDate,
}: ReadingSettingsContentProps) {
  return (
    <View>
      <FontAlignmentContent viewType={viewType} />
      <View className="my-5" />
      <LanguagePickerContent onVersionSelect={onVersionSelect} activeDate={activeDate} />
    </View>
  );
}
