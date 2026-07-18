import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: Props) {
  return (
    <View className="mb-2.5 flex-row items-center justify-between">
      <Text
        className="text-muted dark:text-muted-dark text-sm"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {label}
      </Text>
      <Text
        className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default InfoRow;
