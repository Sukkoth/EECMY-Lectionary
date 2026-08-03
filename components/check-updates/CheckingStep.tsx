import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "@/lib/i18n";

type CheckingStepProps = {
  isDark?: boolean;
};

function CheckingStep({ isDark }: CheckingStepProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-surface dark:bg-surface-dark items-center rounded-2xl px-6 py-12">
      <View className="mb-4 rounded-full bg-primary/10 p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
      <Text
        className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
      >
        {t("checking")}
      </Text>
      <Text
        className="text-muted dark:text-muted-dark mt-1 text-center text-sm"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {t("fetchingManifests")}
      </Text>
    </View>
  );
}

export default CheckingStep;
