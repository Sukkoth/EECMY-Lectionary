import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MonthGrid from "@/components/calendar/MonthGrid";
import type { HolidayIndex } from "@/lib/hooks/useHolidays";
import { getHolidaysForActiveMonth } from "@/lib/hooks/useHolidays";
import type { DayInfoIndex } from "@/lib/hooks/useDayInfo";
import { getDayInfoForActiveMonth } from "@/lib/hooks/useDayInfo";
import type { EventIndex } from "@/lib/hooks/useEvents";
import { getEventsForActiveMonth } from "@/lib/hooks/useEvents";
import { useTranslation } from "@/lib/i18n";
import { useIsDark } from "@/lib/useIsDark";
import { HOLIDAY_COLORS, DEFAULT_CUSTOM_EVENT_COLOR } from "@/constants";
import type { CalendarStyle } from "@/lib/settings";
import {
  formatMonth,
  formatEvangelistYear,
  getSubMonthSpanString,
  gregorianToEthiopian,
  gregorianYmdToEthiopian,
} from "@/lib/ethiopianCalendar";

import type { CustomEventData } from "@/components/calendar/AddEventModal";

const HOLIDAY_LIST_CONTENT_STYLE = { paddingBottom: 130 };

function formatYear(year: number, month: number, isEth: boolean, lang: string = "am"): string {
  const targetEthYear = isEth ? year : gregorianToEthiopian(new Date(year, month, 15)).year;
  const evText = formatEvangelistYear(targetEthYear, lang);
  return `${year} • ${evText}`;
}

export type CalendarFeedItem =
  | {
      kind: "holiday";
      id: string;
      title: string;
      subtitle: string;
      displayDay: number;
      displayEndDay?: number;
      themeColor: string;
    }
  | {
      kind: "custom_event";
      id: string;
      title: string;
      tagLabel?: string | null;
      tagColor?: string | null;
      time?: string;
      hasReminder?: boolean;
      reminderCount?: number;
      notes?: string;
      displayDay: number;
      isPinned?: boolean;
      customEvent: CustomEventData;
    };

type MonthPageProps = {
  year: number;
  month: number;
  isEth: boolean;
  holidayIndex?: HolidayIndex;
  dayInfoIndex?: DayInfoIndex;
  eventIndex?: EventIndex;
  screenWidth: number;
  calendarStyle: CalendarStyle;
  showSeasonColors: boolean;
  onOpenPicker?: (year: number, month: number) => void;
  onOpenAddEvent?: (year: number, month: number, day?: number) => void;
  onOpenEditEvent?: (event: CustomEventData) => void;
};

export const MonthPage = React.memo(function MonthPage({
  year,
  month,
  isEth,
  holidayIndex,
  dayInfoIndex,
  eventIndex,
  screenWidth,
  calendarStyle,
  showSeasonColors,
  onOpenPicker,
  onOpenAddEvent,
  onOpenEditEvent,
}: MonthPageProps) {
  const { t, lang } = useTranslation();
  const isDark = useIsDark();

  // O(1) lookup from pre-indexed data structures
  const { holidayMap, holidays } = useMemo(() => {
    const { map, list } = getHolidaysForActiveMonth(
      holidayIndex,
      year,
      month,
      isEth,
      lang,
    );
    return { holidayMap: map, holidays: list };
  }, [holidayIndex, year, month, isEth, lang]);

  // Combine church feasts and user custom events for this active month
  const feedItems = useMemo(() => {
    const holidayFeed: CalendarFeedItem[] = holidays.map((h, i) => ({
      kind: "holiday",
      id: h.id ?? `holiday-${h.date}-${h.name}-${i}`,
      title: h.name,
      subtitle: h.type,
      displayDay: h.displayDay,
      displayEndDay: h.displayEndDay,
      themeColor: HOLIDAY_COLORS[h.type] ?? "#3b82f6",
    }));

    let userEventFeed: CalendarFeedItem[] = [];

    if (eventIndex) {
      const activeEvents = getEventsForActiveMonth(eventIndex, year, month, isEth);
      userEventFeed = activeEvents.map(({ event: e, displayDay }) => ({
        kind: "custom_event",
        id: e.id,
        title: e.title,
        tagLabel: e.tagName || null,
        tagColor: e.tagColor,
        time: e.hasReminder ? e.reminderTime : undefined,
        hasReminder: e.hasReminder,
        reminderCount: e.reminderOffsets?.length ?? (e.hasReminder ? 1 : 0),
        notes: e.notes,
        displayDay,
        isPinned: e.isPinned,
        customEvent: e,
      }));
    }

    return [...holidayFeed, ...userEventFeed].sort(
      (a, b) => a.displayDay - b.displayDay,
    );
  }, [holidays, eventIndex, year, month, isEth]);

  const customEventsMap = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const item of feedItems) {
      if (item.kind === "custom_event") {
        const day = item.displayDay;
        const color = item.tagColor || DEFAULT_CUSTOM_EVENT_COLOR;
        let list = map.get(day);
        if (!list) {
          list = [];
          map.set(day, list);
        }
        if (!list.includes(color)) {
          list.push(color);
        }
      }
    }
    return map;
  }, [feedItems]);

  const dayInfoMap = useMemo(() => {
    return getDayInfoForActiveMonth(dayInfoIndex, year, month, isEth);
  }, [dayInfoIndex, year, month, isEth]);

  const monthTitle = useMemo(() => formatMonth(month, isEth, lang), [month, isEth, lang]);
  const yearSubtitle = useMemo(() => formatYear(year, month, isEth, lang), [year, month, isEth, lang]);
  const subSpan = useMemo(() => getSubMonthSpanString(year, month, isEth, lang), [year, month, isEth, lang]);

  const renderFeedItem = useCallback(
    ({ item }: { item: CalendarFeedItem }) => {
      if (item.kind === "holiday") {
        const isSpan = item.displayEndDay && item.displayEndDay !== item.displayDay;
        const dayText = isSpan
          ? `${item.displayDay}–${item.displayEndDay}`
          : `${item.displayDay}`;

        return (
          <View className="will-change-variable bg-surface dark:bg-surface-dark my-1.5 flex-row items-start justify-between rounded-2xl border border-stone-200/50 p-4 dark:border-stone-800/50">
            {/* Left: Accent Line + Feast Info */}
            <View className="flex-1 flex-row items-stretch gap-3 pr-3">
              <View
                className="w-1.5 self-stretch rounded-full my-0.5"
                style={{ backgroundColor: item.themeColor }}
              />
              <View className="flex-1">
                <Text
                  maxFontSizeMultiplier={1.2}
                  className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {item.title}
                </Text>
                <Text
                  maxFontSizeMultiplier={1.2}
                  className="text-muted dark:text-muted-dark mt-0.5 text-xs font-medium capitalize"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {item.subtitle}
                </Text>
              </View>
            </View>

            {/* Right: Date Number */}
            <Text
              allowFontScaling={false}
              className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
              }}
            >
              {dayText}
            </Text>
          </View>
        );
      }

      // User Custom Event
      const accentColor = item.tagColor || DEFAULT_CUSTOM_EVENT_COLOR;

      return (
        <TouchableOpacity
          onPress={() => onOpenEditEvent?.(item.customEvent)}
          activeOpacity={0.7}
          className="will-change-variable bg-surface dark:bg-surface-dark my-1.5 flex-row items-center justify-between rounded-2xl border border-stone-200/60 p-4 dark:border-stone-800/60"
        >
          {/* Left: Custom Tag Accent Bar + Event Content */}
          <View className="flex-1 flex-row items-stretch gap-3 pr-3">
            <View
              className="w-1.5 self-stretch rounded-full my-0.5"
              style={{ backgroundColor: accentColor }}
            />

            <View className="flex-1">
              {/* Title */}
              <Text
                maxFontSizeMultiplier={1.2}
                className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {item.title}
              </Text>

              {/* Meta Chips: Tag, Reminder Time & Pinned Status */}
              {(item.tagLabel || item.time || item.isPinned) && (
                <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
                  {item.isPinned ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-blue-500/15 dark:bg-blue-500/25 px-2 py-0.5">
                      <Ionicons name="pin" size={11} color="#3b82f6" />
                      <Text
                        allowFontScaling={false}
                        className="text-primary dark:text-blue-400 text-[11px] font-semibold"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {t("pinned")}
                      </Text>
                    </View>
                  ) : null}

                  {item.tagLabel ? (
                    <View
                      className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ backgroundColor: `${accentColor}18` }}
                    >
                      <View
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <Text
                        allowFontScaling={false}
                        className="text-[11px] font-semibold"
                        style={{ color: accentColor, fontFamily: "ReadingFont" }}
                      >
                        {item.tagLabel}
                      </Text>
                    </View>
                  ) : null}

                  {item.time ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-stone-200/50 dark:bg-stone-800/50 px-2 py-0.5">
                      <Ionicons
                        name={item.hasReminder ? "notifications-outline" : "time-outline"}
                        size={11}
                        color={isDark ? "#A8A29E" : "#78716C"}
                      />
                      <Text
                        allowFontScaling={false}
                        className="text-muted dark:text-muted-dark text-[11px] font-medium"
                        style={{ fontFamily: "ReadingFont" }}
                      >
                        {item.time}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Optional Notes Preview */}
              {Boolean(item.notes) && (
                <Text
                  numberOfLines={1}
                  className="text-muted/70 dark:text-muted-dark/70 mt-1 text-xs"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {item.notes}
                </Text>
              )}
            </View>
          </View>

          {/* Right: Date Number & Edit Affordance */}
          <View className="items-end justify-center pl-1 gap-1">
            <Text
              allowFontScaling={false}
              className="text-base font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
              }}
            >
              {item.displayDay}
            </Text>

            <View className="h-6 w-6 items-center justify-center rounded-full bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons
                name="pencil-sharp"
                size={11}
                color={isDark ? "#A8A29E" : "#78716C"}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [isDark, onOpenEditEvent],
  );

  const feedKeyExtractor = useCallback(
    (item: CalendarFeedItem) => item.id,
    [],
  );

  return (
    <View collapsable={false} style={{ flex: 1, backgroundColor: "transparent" }}>
      {/* Month Title & Sub-Info Header (moves smoothly with animation) */}
      <View className="px-6 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => onOpenPicker?.(year, month)}
          activeOpacity={0.7}
          className="self-start"
        >
          <View className="flex-row items-center gap-1.5">
            <Text
              maxFontSizeMultiplier={1.2}
              className="text-3xl font-semibold tracking-tight text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont" }}
            >
              {monthTitle}
            </Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color={isDark ? "#E8E4DC" : "#2D2A24"}
            />
          </View>
          <Text
            maxFontSizeMultiplier={1.2}
            className="text-primary mt-1 text-sm font-semibold uppercase tracking-wide"
            style={{ fontFamily: "ReadingFont" }}
          >
            {yearSubtitle}
          </Text>
          <Text
            maxFontSizeMultiplier={1.2}
            className="text-muted dark:text-muted-dark mt-0.5 text-xs font-medium"
            style={{ fontFamily: "ReadingFont" }}
          >
            {subSpan}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month Grid */}
      <MonthGrid
        year={year}
        month={month}
        holidays={holidayMap}
        customEvents={customEventsMap}
        dayInfoMap={dayInfoMap}
        width={screenWidth}
        calendarStyle={calendarStyle}
        showSeasonColors={showSeasonColors}
        onLongPressDay={(d) => onOpenAddEvent?.(year, month, d)}
      />

      {/* Section Divider */}
      <View className="mx-6 my-4 border-b border-stone-200/50 dark:border-stone-800/50" />

      {/* Holidays List */}
      <View
        collapsable={false}
        style={{ flex: 1, backgroundColor: "transparent" }}
        className="px-6"
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            maxFontSizeMultiplier={1.2}
            className="text-muted dark:text-muted-dark text-xs font-semibold uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("holidaysAndEvents")}
          </Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => onOpenAddEvent?.(year, month)}
              activeOpacity={0.7}
              className="h-9 bg-primary/10 flex-row items-center justify-center gap-1 rounded-full px-3"
            >
              <Ionicons name="add" size={15} color="#3b82f6" />
              <Text
                allowFontScaling={false}
                className="text-primary text-xs font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {t("add")}
              </Text>
            </TouchableOpacity>

            <View className="h-9 bg-stone-200/60 dark:bg-stone-800/60 items-center justify-center rounded-full px-3">
              <Text
                allowFontScaling={false}
                className="text-muted dark:text-muted-dark text-xs font-semibold"
                style={{ fontFamily: "ReadingFont" }}
              >
                {feedItems.length} {feedItems.length === 1 ? t("event") : t("events")}
              </Text>
            </View>
          </View>
        </View>

        {feedItems.length === 0 ? (
          <View
            collapsable={false}
            style={{ flex: 1, backgroundColor: "transparent" }}
          >
            <View className="will-change-variable bg-surface dark:bg-surface-dark my-2 items-center justify-center rounded-2xl border border-stone-200/40 p-6 dark:border-stone-800/40">
              <Ionicons name="sparkles-outline" size={22} color="#6b6560" />
              <Text
                className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {t("noHolidaysThisMonth")}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={feedItems}
            renderItem={renderFeedItem}
            keyExtractor={feedKeyExtractor}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            className="flex-1"
            contentContainerStyle={HOLIDAY_LIST_CONTENT_STYLE}
          />
        )}
      </View>
    </View>
  );
});
