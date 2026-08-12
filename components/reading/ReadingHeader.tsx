import { forwardRef } from "react";
import { Text, TouchableOpacity, View, useColorScheme, Appearance } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSettings } from "@/lib/SettingsContext";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

type ReadingHeaderProps = {
  weekday: string;
  formattedDate: string;
};

const ReadingHeader = forwardRef<BottomSheetModal, ReadingHeaderProps>(
  ({ weekday, formattedDate }, ref) => {
    const isDark = useColorScheme() === "dark";
    const { updateSetting } = useSettings();

    const toggleTheme = () => {
      const newTheme = isDark ? "light" : "dark";
      updateSetting("theme", newTheme);
      Appearance.setColorScheme(newTheme);
    };

    return (
      <View className="border-b border-stone-200 px-6 pb-4 pt-12 dark:border-stone-800">
        <View className="flex-row items-center justify-between">
          {/* Left: weekday + date */}
          <View className="flex-1">
            <Text
              className="text-[22px] leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {weekday}, {formattedDate}
            </Text>
          </View>

          {/* Right: ellipsis options + theme toggle */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.present()}
              activeOpacity={0.7}
              className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
            >
              <AntDesign name="ellipsis" size={20} color="#6B6560" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
            >
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color="#6B6560" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

ReadingHeader.displayName = "ReadingHeader";

export default ReadingHeader;
