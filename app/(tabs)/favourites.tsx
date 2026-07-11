import { useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  useColorScheme,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useFocusEffect, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useFavourite } from "@/lib/FavouriteContext";
import { useSettings } from "@/lib/SettingsContext";
import { type HydratedFavourite, hydrateFavourites } from "@/lib/FavouriteRepository";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FavouritesScreen() {
  const isDark = useColorScheme() === "dark";
  const { favourites, removeFavourite, clearAll } = useFavourite();
  const db = useSQLiteContext();
  const { settings } = useSettings();

  const [hydratedFavourites, setHydratedFavourites] = useState<HydratedFavourite[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function hydrate() {
        const rows = await hydrateFavourites(db, favourites, settings.language, settings.version);
        if (!cancelled) setHydratedFavourites(rows);
      }

      hydrate().catch((err) => console.warn("[Favourites] Hydration failed:", err));
      return () => {
        cancelled = true;
      };
    }, [favourites, settings.language, settings.version, db]),
  );

  function handleClearAll() {
    setShowClearConfirm(true);
  }

  function handleRead(fav: HydratedFavourite) {
    const [year, month, day] = fav.date.split("-");
    router.push(`/reading?year=${year}&month=${month}&day=${day}`);
  }

  function handleShare(fav: HydratedFavourite) {
    Share.share({ message: `${fav.text}\n\n${fav.reference}` });
  }

  function handleDelete(fav: HydratedFavourite) {
    removeFavourite(fav.date, fav.order);
  }

  // ─── Empty state ────────────────────────────────────────────
  if (favourites.length === 0) {
    return (
      <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark" >
        <View className="mt-8 flex-1 items-center justify-center px-8">
          <View className="bg-surface dark:bg-surface-dark mb-6 rounded-full p-5">
            <Ionicons
              name="bookmark-outline"
              size={36}
              color={isDark ? "#8A8480" : "#6B6560"}
            />
          </View>
          <Text
            className="mb-2 text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            No favourites yet
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mb-8 text-center text-sm leading-5"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Save your favourite passages to revisit them later. Start by exploring
            today&rsquo;s readings.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-primary rounded-xl px-5 py-2.5"
            onPress={() => router.push("/reading")}
          >
            <Text
              className="text-center text-base text-white"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              Browse Today&rsquo;s Readings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Favourites list ────────────────────────────────────────
  return (
    <View className="flex-1 bg-bg-warm dark:bg-bg-warm-dark" >
      <ScrollView className="mt-6 flex-1 px-6 pt-2">
        {/* Header */}
        <View className="mb-4 mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              className="text-2xl leading-tight text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              Favourites
            </Text>
            <View className="bg-primary-dimmed ml-3 rounded-full px-2.5 py-0.5">
              <Text
                className="text-xs text-[#3b82f6]"
                style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
              >
                {favourites.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Action bar */}
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            className="mr-3 rounded-xl border border-red-400 px-5 py-2.5 dark:border-red-500"
            onPress={handleClearAll}
          >
            <Text
              className="text-center text-sm text-red-600 dark:text-red-400"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Favourite cards */}
        {hydratedFavourites.map((fav) => (
          <View
            key={`${fav.date}-${fav.order}`}
            className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl p-5"
          >
            {/* Reference heading */}
            <Text
              className="mb-2 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              {fav.reference || "Reading"}
            </Text>

            {/* Passage preview — 2 lines max */}
            <Text
              className="text-muted dark:text-muted-dark mb-4 text-sm leading-5"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              numberOfLines={2}
            >
              {fav.text}
            </Text>

            {/* Footer row: date | actions */}
            <View className="flex-row items-center justify-between">
              <Text
                className="text-muted dark:text-muted-dark text-xs"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Saved {formatDate(fav.createdAt)}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mr-3 rounded-lg p-1.5"
                  onPress={() => handleRead(fav)}
                >
                  <Ionicons
                    name="book-outline"
                    size={18}
                    color={isDark ? "#60a5fa" : "#3b82f6"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mr-3 rounded-lg p-1.5"
                  onPress={() => handleShare(fav)}
                >
                  <Octicons
                    name="share-android"
                    size={16}
                    color={isDark ? "#60a5fa" : "#3b82f6"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="rounded-lg p-1.5"
                  onPress={() => handleDelete(fav)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={isDark ? "#ef4444" : "#dc2626"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Clear All Confirmation Modal */}
      <Modal visible={showClearConfirm} transparent animationType="fade" onRequestClose={() => setShowClearConfirm(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-[#1C1C1C]">
            <Text
              className="mb-2 text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
            >
              Clear All
            </Text>
            <Text
              className="mb-6 text-base text-[#2D2A24]/70 dark:text-[#E8E4DC]/70"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Remove all favourites? This action cannot be undone.
            </Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl bg-gray-100 px-5 py-2.5 dark:bg-[#2A2A2A]"
                onPress={() => setShowClearConfirm(false)}
              >
                <Text
                  className="text-center text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl bg-red-500 px-5 py-2.5"
                onPress={() => {
                  setShowClearConfirm(false);
                  clearAll();
                }}
              >
                <Text
                  className="text-center text-base text-white"
                  style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
