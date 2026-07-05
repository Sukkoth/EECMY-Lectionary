import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_FAVOURITES, type FavouriteReading } from "@/lib/types";

export default function FavouritesScreen() {
  const isDark = useColorScheme() === "dark";

  // Toggle this to false to see empty state
  const hasFavourites = true;

  if (!hasFavourites) {
    return (
      <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark mt-8 flex-1">
        <View className="mt-8 flex-1 items-center justify-center px-8">
          <View className="bg-surface dark:bg-surface-dark mb-6 rounded-full p-5">
            <Ionicons name="bookmark-outline" size={36} color={isDark ? "#8A8480" : "#6B6560"} />
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
            Save your favourite passages to revisit them later. Start by exploring today&rsquo;s
            readings.
          </Text>
          <TouchableOpacity activeOpacity={0.7} className="bg-primary rounded-xl px-5 py-2.5">
            <Text
              className="text-center text-base text-white"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              Browse Today&rsquo;s Readings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderFavourite = (fav: FavouriteReading) => (
    <View key={fav.id} className="bg-surface dark:bg-surface-dark mb-4 rounded-2xl p-5">
      {/* Reference heading */}
      <Text
        className="mb-2 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
      >
        {fav.reference}
      </Text>

      {/* Passage preview — 2 lines max */}
      <Text
        className="text-muted dark:text-muted-dark mb-4 text-sm leading-5"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        numberOfLines={2}
      >
        {fav.passagePreview}
      </Text>

      {/* Footer row: date | actions */}
      <View className="flex-row items-center justify-between">
        <Text
          className="text-muted dark:text-muted-dark text-xs"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          Saved {fav.dateSaved}
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity activeOpacity={0.7} className="mr-3 rounded-xl px-3 py-1.5">
            <Text
              className="text-sm text-[#3b82f6]"
              style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
            >
              Read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} className="mr-3 rounded-lg p-1.5">
            <Ionicons name="share-outline" size={18} color={isDark ? "#60a5fa" : "#3b82f6"} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} className="rounded-lg p-1.5">
            <Ionicons name="trash-outline" size={18} color={isDark ? "#ef4444" : "#dc2626"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <ScrollView className="mt-6 flex-1 px-6 pt-2">
        {/* Header*/}
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
                {MOCK_FAVOURITES.length}
              </Text>
            </View>
          </View>
        </View>

        {/*Action bar*/}
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            className="mr-3 rounded-xl border border-red-400 px-5 py-2.5 dark:border-red-500"
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

        {/* Favourites list */}
        {MOCK_FAVOURITES.map(renderFavourite)}
      </ScrollView>
    </SafeAreaView>
  );
}
