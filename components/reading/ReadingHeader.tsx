import { forwardRef } from "react";
import { Text, TouchableOpacity, View, useColorScheme, Appearance } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

type ReadingHeaderProps = {
  weekday: string;
  formattedDate: string;
  title: string | null;
  onClose: () => void;
};

const ReadingHeader = forwardRef<BottomSheetModal, ReadingHeaderProps>(
  ({ weekday, formattedDate, title, onClose }, ref) => {
    const isDark = useColorScheme() === "dark";

    const toggleTheme = () => {
      Appearance.setColorScheme(isDark ? "light" : "dark");
    };

    return (
      <View className="border-b border-stone-200 px-6 pb-4 pt-10 dark:border-stone-800">
        <View className="flex-row items-start justify-between">
          {/* Left: weekday + date + liturgical day title */}
          <View className="flex-1">
            <Text
              className="text-[22px] leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {weekday}, {formattedDate}
            </Text>
            {title ? (
              <Text
                className="text-muted dark:text-muted-dark mt-0.5 text-xs uppercase tracking-widest"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {title}
              </Text>
            ) : null}
          </View>

          {/* Right: language switch + theme toggle + close */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.present()}
              activeOpacity={0.7}
              className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
            >
              <Ionicons name="language-outline" size={20} color="#6B6560" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
            >
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color="#6B6560" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
            >
              <Ionicons name="close" size={20} color="#6B6560" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

ReadingHeader.displayName = "ReadingHeader";

export default ReadingHeader;
