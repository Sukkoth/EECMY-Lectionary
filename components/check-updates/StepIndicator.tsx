import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { WizardStep } from "../../app/settings/check-updates/types";
import { STEP_LABELS, STEP_ICONS } from "../../app/settings/check-updates/types";

type Props = {
  currentStep: WizardStep;
  isDark: boolean;
};

function StepIndicator({ currentStep, isDark }: Props) {
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
    <View className="mb-6 flex-row items-center justify-between">
      {STEP_LABELS.map((label, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <View key={label} className="flex-1 items-center">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${
                isCompleted
                  ? "bg-primary"
                  : isActive
                    ? "border-2 border-primary bg-primary/10"
                    : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={18} color="white" />
              ) : (
                <Ionicons
                  name={STEP_ICONS[index] as any}
                  size={18}
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
              className={`mt-1.5 text-xs ${
                isActive || isCompleted
                  ? "text-[#2D2A24] dark:text-[#E8E4DC]"
                  : "text-muted dark:text-muted-dark"
              }`}
              style={{
                fontFamily: "ReadingFont",
                fontWeight: isActive ? "600" : "400",
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default StepIndicator;
