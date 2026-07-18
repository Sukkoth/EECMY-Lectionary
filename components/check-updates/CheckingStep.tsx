import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  isDark: boolean;
};

function CheckingStep({ isDark }: Props) {
  return (
    <View className="items-center py-12">
      <ActivityIndicator
        size="large"
        color={isDark ? "#E8E4DC" : "#2D2A24"}
      />
      <Text
        className="text-muted dark:text-muted-dark mt-4 text-base"
        style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
      >
        Checking for available updates…
      </Text>
    </View>
  );
}

export default CheckingStep;
