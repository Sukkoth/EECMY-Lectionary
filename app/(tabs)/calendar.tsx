import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthYearPickerModal from "@/components/calendar/MonthYearPickerModal";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import {
  CalendarSwiper,
  type CalendarSwiperRef,
} from "@/components/calendar/CalendarSwiper";
import { CalendarStyleToggle } from "@/components/calendar/CalendarStyleToggle";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHolidays } from "@/lib/hooks/useHolidays";
import { useDayInfo } from "@/lib/hooks/useDayInfo";
import { useSettings } from "@/lib/SettingsContext";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { gregorianToEthiopian } from "@/lib/ethiopianCalendar";

function getInitialCurrent(isEth: boolean) {
  const now = new Date();
  if (isEth) {
    const eth = gregorianToEthiopian(now);
    return { year: eth.year, month: eth.month };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default function CalendarScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const isDark = useIsDark();
  const { settings, updateSetting } = useSettings();
  const { t, lang } = useTranslation();
  const isEth = settings.calendarStyle === "ethiopian";

  const [current, setCurrent] = useState(() => getInitialCurrent(isEth));
  const [pickerSelected, setPickerSelected] = useState(() => getInitialCurrent(isEth));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventInitialDay, setAddEventInitialDay] = useState<number | undefined>(undefined);
  const swiperRef = useRef<CalendarSwiperRef>(null);
  const pickerSheetRef = useRef<BottomSheetModal>(null);
  const addEventSheetRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();

  // Handle hardware back press on Android when picker bottom sheet is open
  useEffect(() => {
    if (!isPickerOpen && !isAddEventOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isAddEventOpen) {
        addEventSheetRef.current?.dismiss();
        setIsAddEventOpen(false);
        return true;
      }
      if (isPickerOpen) {
        pickerSheetRef.current?.dismiss();
        setIsPickerOpen(false);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [isPickerOpen, isAddEventOpen]);

  // Handle navigation beforeRemove (e.g. gesture back navigation)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isAddEventOpen) {
        e.preventDefault();
        addEventSheetRef.current?.dismiss();
        setIsAddEventOpen(false);
      } else if (isPickerOpen) {
        e.preventDefault();
        pickerSheetRef.current?.dismiss();
        setIsPickerOpen(false);
      }
    });
    return unsubscribe;
  }, [navigation, isPickerOpen, isAddEventOpen]);

  // Compute today once per render cycle (stable within a render)
  const today = useMemo(() => new Date(), []);
  const ethToday = useMemo(() => gregorianToEthiopian(today), [today]);

  const handleToggleCalendarStyle = useCallback(
    (newStyle: "ethiopian" | "gregorian") => {
      if (newStyle === settings.calendarStyle) return;
      const newIsEth = newStyle === "ethiopian";
      const initial = getInitialCurrent(newIsEth);
      setCurrent(initial);
      setPickerSelected(initial);
      updateSetting("calendarStyle", newStyle);
      swiperRef.current?.jumpTo(initial);
    },
    [settings.calendarStyle, updateSetting],
  );

  const handleJumpToToday = useCallback(() => {
    const initial = getInitialCurrent(isEth);
    setCurrent(initial);
    setPickerSelected(initial);
    swiperRef.current?.jumpTo(initial);
  }, [isEth]);

  const handleOpenPicker = useCallback((year: number, month: number) => {
    setPickerSelected({ year, month });
    setIsPickerOpen(true);
    pickerSheetRef.current?.present();
  }, []);

  const handleOpenAddEvent = useCallback(
    (year: number, month: number, day?: number) => {
      setPickerSelected({ year, month });
      if (day != null) {
        setAddEventInitialDay(day);
      } else {
        const isThisMonthToday = isEth
          ? year === ethToday.year && month === ethToday.month
          : year === today.getFullYear() && month === today.getMonth();
        const defaultDay = isThisMonthToday
          ? isEth
            ? ethToday.day
            : today.getDate()
          : 1;
        setAddEventInitialDay(defaultDay);
      }
      setIsAddEventOpen(true);
      addEventSheetRef.current?.present();
    },
    [isEth, ethToday, today],
  );

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrent({ year, month });
  }, []);

  const handlePickerSelect = useCallback((y: number, m: number) => {
    const target = { year: y, month: m };
    setCurrent(target);
    setPickerSelected(target);
    swiperRef.current?.jumpTo(target);
  }, []);

  const { data: holidayIndex } = useHolidays(lang, settings.language);
  const { data: dayInfoIndex } = useDayInfo(lang, settings.language);

  const isCurrentTodayMonth = isEth
    ? current.year === ethToday.year && current.month === ethToday.month
    : current.year === today.getFullYear() && current.month === today.getMonth();

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      {/* Top Fixed Control Bar */}
      <View className="flex-row items-center justify-between px-6 pt-11 pb-2">
        {/* Left: Calendar System Segmented Toggle */}
        <CalendarStyleToggle
          isEth={isEth}
          onToggle={handleToggleCalendarStyle}
          ethiopianLabel={t("ethiopian")}
          gregorianLabel={t("gregorian")}
        />

        {/* Right: Today Button + Chevron Controls */}
        <View className="flex-row items-center gap-2">
          {!isCurrentTodayMonth && (
            <TouchableOpacity
              onPress={handleJumpToToday}
              activeOpacity={0.75}
              className="bg-primary/10 flex-row items-center justify-center gap-1 rounded-full px-3 h-9"
            >
              <Ionicons name="today-outline" size={14} color="#3b82f6" />
              <Text
                allowFontScaling={false}
                className="text-primary text-xs font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("today")}
              </Text>
            </TouchableOpacity>
          )}

          {/* Capsule Chevron Controls */}
          <View className="will-change-variable bg-surface dark:bg-surface-dark flex-row items-center rounded-full border border-stone-200/60 px-1 h-9 dark:border-stone-800/60">
            <TouchableOpacity
              onPress={() => swiperRef.current?.goToPrev()}
              className="h-full justify-center px-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
            <View className="mx-0.5 my-auto h-4 w-[1px] bg-stone-200 dark:bg-stone-800" />
            <TouchableOpacity
              onPress={() => swiperRef.current?.goToNext()}
              className="h-full justify-center px-1.5"
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#E8E4DC" : "#2D2A24"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Swipeable Calendar (Month Header + Grid + Holidays List move together) */}
      <View className="flex-1 pb-[76px]">
        <CalendarSwiper
          ref={swiperRef}
          initialDate={current}
          isEth={isEth}
          holidayIndex={holidayIndex}
          dayInfoIndex={dayInfoIndex}
          screenWidth={screenWidth}
          calendarStyle={settings.calendarStyle}
          showSeasonColors={settings.showSeasonColors ?? true}
          onMonthChange={handleMonthChange}
          onOpenPicker={handleOpenPicker}
          onOpenAddEvent={handleOpenAddEvent}
        />
      </View>

      <MonthYearPickerModal
        ref={pickerSheetRef}
        selectedYear={pickerSelected.year}
        selectedMonth={pickerSelected.month}
        isEth={isEth}
        onChange={(idx) => {
          setIsPickerOpen(idx >= 0);
        }}
        onDismiss={() => {
          setIsPickerOpen(false);
        }}
        onSelect={handlePickerSelect}
      />

      <AddEventModal
        ref={addEventSheetRef}
        selectedYear={pickerSelected.year}
        selectedMonth={pickerSelected.month}
        isEth={isEth}
        initialDay={addEventInitialDay}
        onChange={(idx: number) => {
          setIsAddEventOpen(idx >= 0);
        }}
        onDismiss={() => {
          setIsAddEventOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
