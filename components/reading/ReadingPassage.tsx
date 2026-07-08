import { Text, View } from "react-native";

type ReadingPassageProps = {
  text: string;
};

export default function ReadingPassage({ text }: ReadingPassageProps) {
  return (
    <View className="mb-8">
      <Text
        className="text-center text-xl leading-7 text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {text}
      </Text>
    </View>
  );
}
