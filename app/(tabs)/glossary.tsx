import { Text, View } from "react-native";

export default function GlossaryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
      <Text
        className="text-black dark:text-white"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        Glossary
      </Text>
    </View>
  );
}
