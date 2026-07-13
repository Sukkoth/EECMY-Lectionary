import { forwardRef } from "react";
import { useColorScheme } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ReadingSettingsContent from "./ReadingSettingsContent";
import { useSettings, SettingsContext } from "@/lib/SettingsContext";

type LanguageSwitcherSheetProps = {
  onChange?: (index: number) => void;
  viewType: "simple" | "expanded";
};

const LanguageSwitcherSheet = forwardRef<BottomSheetModal, LanguageSwitcherSheetProps>(({ onChange, viewType }, ref) => {
  const isDark = useColorScheme() === "dark";
  const ctx = useSettings();

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["75%"]}
      onChange={onChange}
      backgroundStyle={{
        backgroundColor: isDark ? "#1C1C1C" : "#FFFFFF",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#525252" : "#D4D4D4",
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsContext.Provider value={ctx}>
          <ReadingSettingsContent viewType={viewType} />
        </SettingsContext.Provider>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

LanguageSwitcherSheet.displayName = "LanguageSwitcherSheet";

export default LanguageSwitcherSheet;
