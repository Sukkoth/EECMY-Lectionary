import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";

type Manifest = {
  dataYear: number;
  lastUpdated: string;
  version: string;
  size: string;
  languages: { code: string; name: string; versions: string[] }[];
};

const MOCK_MANIFEST: Manifest = {
  dataYear: 2024,
  lastUpdated: "June 15, 2026",
  version: "2.1.0",
  size: "4.2 MB",
  languages: [
    { code: "en", name: "English", versions: ["niv", "kjv"] },
    { code: "am", name: "አማርኛ", versions: ["am54", "nasv"] },
  ],
};

export default function ContentUpdateScreen() {
  const isDark = useColorScheme() === "dark";
  const { settings } = useSettings();
  const [fetching, setFetching] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleFetch = () => {
    setFetching(true);
    setFetchError(null);
    // Mock: simulate network delay
    setTimeout(() => {
      setFetching(false);
      setManifest(MOCK_MANIFEST);
    }, 1500);
  };

  const handleDownload = () => {
    setDownloading(true);
    // Mock: simulate download
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 2500);
  };

  const currentLang = MOCK_MANIFEST.languages.find((l) => l.code === settings.language);
  const currentLangVersions = currentLang?.versions
    .filter((v) => v === settings.version)
    .map((v) => v.toUpperCase())
    .join(", ");

  return (
    <SafeAreaView className="bg-bg-warm dark:bg-bg-warm-dark flex-1">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mb-8 mt-8 flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="bg-surface dark:bg-surface-dark rounded-full p-2.5"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#E8E4DC" : "#2D2A24"} />
          </TouchableOpacity>
          <Text
            className="text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Content Update
          </Text>
        </View>

        {!manifest && !fetchError && (
          <View className="bg-surface dark:bg-surface-dark mb-6 items-center rounded-2xl px-6 py-8">
            <View className="mb-4 rounded-full bg-green-500/10 p-4">
              <Ionicons name="cloud-download-outline" size={36} color="#16a34a" />
            </View>
            <Text
              className="text-center text-base text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Check for the latest Bible readings data to download.
            </Text>
          </View>
        )}

        {/* Fetch manifest */}
        {!manifest && (
          <>
            {fetchError && (
              <View className="mb-6 flex-row items-center gap-3 rounded-2xl bg-red-500/10 px-5 py-4">
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text
                  className="flex-1 text-base text-red-600 dark:text-red-400"
                  style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                >
                  {fetchError}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleFetch}
              disabled={fetching}
              activeOpacity={0.7}
              className="bg-primary flex-row items-center justify-center gap-2 rounded-xl py-4"
            >
              {fetching ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text
                    className="text-center text-base text-white"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    Checking...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="white" />
                  <Text
                    className="text-center text-base text-white"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    Check for Updates
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Manifest info */}
        {manifest && !downloaded && (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="bg-surface dark:bg-surface-dark mb-6 rounded-2xl px-5 py-5">
              <Text
                className="mb-4 text-base text-[#2D2A24] dark:text-[#E8E4DC]"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Available Data
              </Text>

              <InfoRow label="Data Year" value={String(manifest.dataYear)} isDark={isDark} />
              <InfoRow label="Last Updated" value={manifest.lastUpdated} isDark={isDark} />
              <InfoRow label="Version" value={manifest.version} isDark={isDark} />
              <InfoRow label="Size" value={manifest.size} isDark={isDark} />
              <InfoRow
                label="Languages"
                value={manifest.languages.map((l) => l.name).join(", ")}
                isDark={isDark}
              />

              <View className="mt-2 border-t border-stone-200 pt-3 dark:border-stone-700">
                <Text
                  className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
                  style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
                >
                  Your current selection
                </Text>
                <Text
                  className="text-muted dark:text-muted-dark mt-1 text-sm"
                  style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
                >
                  {currentLang?.name ?? settings.language} — {currentLangVersions ?? settings.version.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Download button */}
            <TouchableOpacity
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.7}
              className="bg-primary mb-8 flex-row items-center justify-center gap-2 rounded-xl py-4"
            >
              {downloading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text
                    className="text-center text-base text-white"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    Downloading...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text
                    className="text-center text-base text-white"
                    style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
                  >
                    Download ({manifest.size})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Downloaded confirmation */}
        {downloaded && manifest && (
          <View className="bg-surface dark:bg-surface-dark mb-6 items-center rounded-2xl px-6 py-8">
            <View className="mb-4 rounded-full bg-green-500/10 p-4">
              <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
            </View>
            <Text
              className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
              style={{ fontFamily: "ReadingFont", fontWeight: "700" }}
            >
              Download Complete
            </Text>
            <Text
              className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
              style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
            >
              Bible readings data v{manifest.version} ({manifest.dataYear}) has been downloaded.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setManifest(null);
                setDownloaded(false);
              }}
              activeOpacity={0.7}
              className="bg-primary mt-6 rounded-xl px-8 py-3"
            >
              <Text
                className="text-center text-base text-white"
                style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text
        className="text-muted dark:text-muted-dark text-sm"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {label}
      </Text>
      <Text
        className="text-sm text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "500" }}
      >
        {value}
      </Text>
    </View>
  );
}
