import { View } from "react-native";
import { FormattedText } from "@/lib/formatText";

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
  return (
    <View className="mb-8">
      <FormattedText
        text={text}
        fontSize={fontSize}
        className="text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{
          fontFamily: "ReadingFont",
          fontWeight: "400",
          fontSize,
          textAlign: align,
          lineHeight: fontSize * 1.75,
        }}
      />
    </View>
  );
}
