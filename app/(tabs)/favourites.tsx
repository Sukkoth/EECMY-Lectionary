import { useCallback, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  useColorScheme,
  Share,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { router, useFocusEffect } from "expo-router";
import { useSettings } from "@/lib/SettingsContext";
import {
  useHydratedFavourites,
  useRemoveFavourite,
  useClearFavourites,
  FAVOURITE_KEYS,
} from "@/lib/hooks/useFavourites";
import { useQueryClient } from "@tanstack/react-query";
import { type HydratedFavourite } from "@/lib/FavouriteRepository";
import { stripFormattedTags } from "@/lib/formatText";

import { useTranslation } from "@/lib/i18n";
import { formatDisplayDate } from "@/lib/ethiopianCalendar";
import type { CalendarStyle } from "@/lib/settings";

function formatDate(iso: string, calendarStyle: CalendarStyle, lang: string): string {
  const d = new Date(iso);
  return formatDisplayDate(d, calendarStyle, lang).dateString;
}

export default function FavouritesScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings } = useSettings();
  const { t, lang } = useTranslation();
  const { data: favourites = [], isLoading } = useHydratedFavourites(
    settings.language,
    settings.version,
  );
  const removeMut = useRemoveFavourite();
  const clearMut = useClearFavourites();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const queryClient = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      queryClient.refetchQueries({ queryKey: FAVOURITE_KEYS.all, type: "all" });
    }, [queryClient]),
  );

  function handleClearAll() {
    setShowClearConfirm(true);
  }

  function handleRead(fav: HydratedFavourite) {
    const [year, month, day] = fav.date.split("-");
    router.push(`/reading?year=${year}&month=${month}&day=${day}&order=${fav.order}`);
  }

  function handleShare(fav: HydratedFavourite) {
    Share.share({
      message: `${stripFormattedTags(fav.text)}\n\n${fav.reference}`,
    });
  }

  function handleDelete(fav: HydratedFavourite) {
    removeMut.mutate({ date: fav.date, order: fav.order });
  }

  // ─── Loading State ───────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="bg-bg-warm dark:bg-bg-warm-dark flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ─── Empty State ─────────────────────────────────────────────
  if (favourites.length === 0) {
    return (
      <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
        <View className="flex-1 px-6 pt-12 items-center justify-center">
          <View className="bg-surface dark:bg-surface-dark border border-stone-200/60 dark:border-stone-800/60 mb-5 rounded-full p-6 shadow-sm">
            <Ionicons name="star-outline" size={40} color="#3b82f6" />
          </View>

          <Text
            className="mb-2 text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            {t("noFavouritesYet")}
          </Text>

          <Text
            className="text-muted dark:text-muted-dark text-center text-sm px-6 leading-relaxed"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Tap the star icon while reading to save your favorite passages here for quick access.
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-primary rounded-xl px-6 py-3 mt-6 shadow-sm"
            onPress={() => router.push("/reading")}
          >
            <Text
              className="text-center text-base text-white"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {t("todaysReading")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Favourites List ─────────────────────────────────────────
  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ScrollView
        className="flex-1 px-6 pt-12"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title + Actions */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text
              className="text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {t("favourites")}
            </Text>
            <View className="bg-primary/10 rounded-full px-3 py-0.5">
              <Text
                className="text-primary text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {favourites.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClearAll}
            className="flex-row items-center gap-1.5 rounded-xl bg-stone-200/60 px-3 py-1.5 dark:bg-stone-800/60"
          >
            <Ionicons
              name="trash-outline"
              size={15}
              color={isDark ? "#ef4444" : "#dc2626"}
            />
            <Text
              className="text-xs font-semibold text-red-600 dark:text-red-400"
              style={{ fontFamily: "ReadingFont" }}
            >
              {t("clearAll")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Journal Accent Cards */}
        {favourites.map((fav) => (
          <TouchableOpacity
            key={`${fav.date}-${fav.order}`}
            activeOpacity={0.85}
            onPress={() => handleRead(fav)}
            className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl border border-stone-200/60 p-5 dark:border-stone-800/60 shadow-sm"
          >
            {/* Top row: Reference Header */}
            <View className="mb-2.5 flex-row items-center justify-between">
              <Text
                className="text-xl text-[#2D2A24] dark:text-[#E8E4DC] flex-1 pr-2"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                {fav.reference || t("reading")}
              </Text>
            </View>

            {/* Passage Snippet — Clean 3-line plain text */}
            <Text
              className="text-[#2D2A24]/80 dark:text-[#E8E4DC]/80 mb-4 text-sm leading-relaxed"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              numberOfLines={3}
            >
              {stripFormattedTags(fav.text)}
            </Text>

            {/* Bottom metadata & Action icons */}
            <View className="flex-row items-center justify-between border-t border-stone-200/50 pt-3 dark:border-stone-800/50">
              <Text
                className="text-muted dark:text-muted-dark text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                {formatDate(fav.createdAt, settings.calendarStyle, lang)}
              </Text>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRead(fav)}
                  className="bg-primary/10 rounded-full p-2"
                >
                  <Ionicons name="book-outline" size={17} color="#3b82f6" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleShare(fav)}
                  className="bg-stone-100 dark:bg-stone-800/80 rounded-full p-2"
                >
                  <Octicons
                    name="share-android"
                    size={16}
                    color={isDark ? "#A3A3A3" : "#6B6560"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDelete(fav)}
                  className="bg-stone-100 dark:bg-stone-800/80 rounded-full p-2"
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={isDark ? "#ef4444" : "#dc2626"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#1C1C1C] border border-stone-200/60 dark:border-stone-800/60 shadow-lg">
            <Text
              className="mb-2 text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {t("clearAll")}
            </Text>
            <Text
              className="mb-6 text-sm text-muted dark:text-muted-dark leading-relaxed"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              {t("confirmClearAllFavourites")}
            </Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl bg-stone-100 px-5 py-2.5 dark:bg-[#2A2A2A]"
                onPress={() => setShowClearConfirm(false)}
              >
                <Text
                  className="text-center text-sm font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl bg-red-600 dark:bg-red-500 px-5 py-2.5"
                onPress={() => {
                  setShowClearConfirm(false);
                  clearMut.mutate();
                }}
              >
                <Text
                  className="text-center text-sm font-semibold text-white"
                  style={{ fontFamily: "ReadingFont" }}
                >
                  {t("clear")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
