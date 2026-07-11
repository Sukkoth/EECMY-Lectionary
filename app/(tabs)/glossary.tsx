import { SafeAreaView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const REFERENCE_TOPICS = [
  {
    icon: "book-outline" as const,
    title: "What is the Lectionary?",
    description: "An introductory guide to the lectionary",
    route: "/glossary/lectionary",
  },
  {
    icon: "calendar-outline" as const,
    title: "Church Year",
    description: "The liturgical calendar of the Church",
    route: "/glossary/church-year",
  },
  {
    icon: "heart-outline" as const,
    title: "Creeds",
    description: "Historic Christian creeds used in worship",
    route: "/glossary/creeds",
  },
  {
    icon: "hand-left-outline" as const,
    title: "The Lord's Prayer",
    description: "The prayer taught by Jesus",
    route: "/glossary/lords-prayer",
  },
];

export default function GlossaryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6 mt-6">
        {/* Title */}
        <Text
          className="mt-8 mb-8 text-3xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Reference
        </Text>

        {/* Topic Cards */}
        {REFERENCE_TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic.route}
            onPress={() => router.push(topic.route as Href)}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark mb-4 flex-row items-center justify-between rounded-2xl px-5 py-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="bg-primary-dimmed rounded-lg p-2">
                <Ionicons name={topic.icon} size={20} color="#3b82f6" />
              </View>
              <View>
                <Text
                  className="text-lg text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                >
                  {topic.title}
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-0.5 text-base"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {topic.description}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#737373" : "#A3A3A3"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
