import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { WizardStep } from "@/lib/types/checkUpdates";
import { STEP_ICONS } from "@/lib/types/checkUpdates";
import { useTranslation, type TranslationKey } from "@/lib/i18n";

type Props = {
  currentStep: WizardStep;
  isDark: boolean;
};

const stepLabelKeys: TranslationKey[] = [
  "stepYears",
  "stepLanguages",
  "stepDownload",
  "stepDone",
];

function StepIndicator({ currentStep, isDark }: Props) {
  const { t } = useTranslation();
  const getStepIndex = (s: WizardStep): number => {
    if (s === "checking") return 0;
    if (s === "selectYear") return 0;
    if (s === "selectLang") return 1;
    if (s === "downloading") return 2;
    if (s === "success") return 3;
    return -1;
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <View className="mb-6 px-1">
      <View className="relative flex-row items-center justify-between">
        {/* Background Connecting Line */}
        <View className="absolute left-[12%] right-[12%] top-4 -z-10 h-[2px] bg-stone-200 dark:bg-stone-800" />

        {/* Active Progress Line */}
        <View
          className="absolute left-[12%] top-4 -z-10 h-[2px] bg-primary"
          style={{
            width:
              activeIndex <= 0
                ? "0%"
                : `${(activeIndex / (stepLabelKeys.length - 1)) * 76}%`,
          }}
        />

        {stepLabelKeys.map((key, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const label = t(key);

          return (
            <View key={key} className="z-10 items-center" style={{ width: 68 }}>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-primary"
                    : isActive
                      ? "border-2 border-primary bg-surface dark:bg-surface-dark"
                      : "border border-stone-300 bg-surface dark:border-stone-700 dark:bg-surface-dark"
                }`}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Ionicons
                    name={STEP_ICONS[index] as any}
                    size={15}
                    color={
                      isActive
                        ? "#3b82f6"
                        : isDark
                          ? "#8a8480"
                          : "#6b6560"
                    }
                  />
                )}
              </View>
              <Text
                className={`mt-1.5 text-center text-xs ${
                  isActive
                    ? "text-[#2D2A24] dark:text-[#E8E4DC]"
                    : isCompleted
                      ? "text-[#2D2A24]/80 dark:text-[#E8E4DC]/80"
                      : "text-muted dark:text-muted-dark"
                }`}
                style={{
                  fontFamily: "ReadingFont",
                  fontWeight: isActive ? "600" : isCompleted ? "500" : "400",
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default StepIndicator;

