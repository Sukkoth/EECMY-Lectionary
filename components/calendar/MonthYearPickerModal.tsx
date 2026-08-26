import React, { forwardRef, useMemo, useCallback, useRef, useEffect } from "react";
import { Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
  ETHIOPIAN_MONTH_NAMES_AM,
  ETHIOPIAN_MONTH_NAMES_EN,
  ETHIOPIAN_MONTH_NAMES_OM,
  GREGORIAN_MONTH_NAMES_AM,
  GREGORIAN_MONTH_NAMES_EN,
  GREGORIAN_MONTH_NAMES_OM,
} from "@/lib/ethiopianCalendar";
import { useTranslation } from "@/lib/i18n";

type MonthYearPickerModalProps = {
  selectedYear: number;
  selectedMonth: number;
  isEth: boolean;
  onSelect: (year: number, month: number) => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
};

const MonthYearPickerModal = forwardRef<BottomSheetModal, MonthYearPickerModalProps>(
  ({ selectedYear, selectedMonth, isEth, onSelect, onClose, onChange, onDismiss }, ref) => {
    const isDark = useColorScheme() === "dark";
    const { width: screenWidth } = useWindowDimensions();
    const { lang, t } = useTranslation();
    const yearScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

    const monthNames = useMemo(() => {
      if (isEth) {
        if (lang === "om") return ETHIOPIAN_MONTH_NAMES_OM;
        if (lang === "en") return ETHIOPIAN_MONTH_NAMES_EN;
        return ETHIOPIAN_MONTH_NAMES_AM;
      } else {
        if (lang === "om") return GREGORIAN_MONTH_NAMES_OM;
        if (lang === "am") return GREGORIAN_MONTH_NAMES_AM;
        return GREGORIAN_MONTH_NAMES_EN;
      }
    }, [isEth, lang]);

    const years = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const startYear = isEth ? currentYear - 15 : currentYear - 10;
      const endYear = isEth ? currentYear + 15 : currentYear + 15;
      const list: number[] = [];
      for (let y = startYear; y <= endYear; y++) {
        list.push(y);
      }
      return list;
    }, [isEth]);

    const centerSelectedYear = useCallback(
      (animated = true) => {
        const index = years.indexOf(selectedYear);
        if (index >= 0 && yearScrollRef.current) {
          const itemWidth = 68; // approx width + margin
          const targetX = index * itemWidth - screenWidth / 2 + itemWidth / 2 + 24;
          yearScrollRef.current.scrollTo({ x: Math.max(0, targetX), animated });
        }
      },
      [years, selectedYear, screenWidth],
    );

    useEffect(() => {
      const timer = setTimeout(() => centerSelectedYear(true), 100);
      return () => clearTimeout(timer);
    }, [selectedYear, centerSelectedYear]);

    const handleMonthPress = (monthIndex: number) => {
      onSelect(selectedYear, monthIndex);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      onClose?.();
    };

    const handleYearPress = (year: number) => {
      onSelect(year, selectedMonth);
    };

    const snapPoints = useMemo(() => ["50%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        index={0}
        onChange={(idx) => {
          if (idx >= 0) centerSelectedYear(false);
          onChange?.(idx);
        }}
        onDismiss={() => {
          onDismiss?.();
          onClose?.();
        }}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: isDark ? "#1C1C1E" : "#F5F3EF",
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#525252" : "#D4D4D4",
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text
              className="text-lg font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("selectDate")}
            </Text>
            <TouchableOpacity
              onPress={() => (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()}
              className="rounded-full bg-stone-200/60 p-2 dark:bg-stone-800/60"
            >
              <Ionicons name="close" size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Year Selector Horizontal Scroll */}
          <Text
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("year")}
          </Text>
          <ScrollView
            ref={yearScrollRef}
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            className="mb-6 flex-row"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {years.map((y) => {
              const isSelected = y === selectedYear;
              return (
                <TouchableOpacity
                  key={y}
                  onPress={() => handleYearPress(y)}
                  activeOpacity={0.7}
                  className={`mr-2 rounded-2xl px-4 py-2 border ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-stone-200/60 bg-surface dark:border-stone-800/60 dark:bg-surface-dark"
                  }`}
                >
                  <Text
                    style={{ fontFamily: "ReadingFont" }}
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-white"
                        : "text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Month Selector Grid */}
          <Text
            className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("month")}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-2.5">
            {monthNames.map((name, index) => {
              const isSelected = index === selectedMonth;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => handleMonthPress(index)}
                  activeOpacity={0.7}
                  className={`w-[31%] items-center justify-center rounded-2xl border py-3.5 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-stone-200/60 bg-surface dark:border-stone-800/60 dark:bg-surface-dark"
                  }`}
                >
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: "ReadingFont" }}
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-white"
                        : "text-[#2D2A24] dark:text-[#E8E4DC]"
                    }`}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

MonthYearPickerModal.displayName = "MonthYearPickerModal";

export default MonthYearPickerModal;
