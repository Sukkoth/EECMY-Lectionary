import { View } from "react-native";
import { FormattedText } from "@/lib/formatText";
import { useSettings } from "@/lib/SettingsContext";
import { getReadingFontFamily } from "@/lib/settings";

type ReadingPassageProps = {
  text: string;
  fontSize: number;
  align: "left" | "center" | "justify";
};

export default function ReadingPassage({
  text,
  fontSize,
  align,
}: ReadingPassageProps) {
  const { settings } = useSettings();
  const fontFamily = getReadingFontFamily(settings.readingFontFamily);

  return (
    <View className="mb-8">
      <FormattedText
        text={text}
        fontSize={fontSize}
        className="text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{
          fontFamily,
          fontWeight: "400",
          fontSize,
          textAlign: align,
          lineHeight: fontSize * 1.75,
        }}
      />
    </View>
  );
}
