import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { YearOption } from "../../app/settings/check-updates/types";
import InfoRow from "./InfoRow";

type Props = {
  year: YearOption;
  selectedLanguageNames: string[];
  selectedVersionLabels: string[];
  totalSelectedItems: number;
  onDone: () => void;
};

function SuccessStep({
  year,
  selectedLanguageNames,
  selectedVersionLabels,
  totalSelectedItems,
  onDone,
}: Props) {
  return (
    <View className="flex-1 justify-center">
      <View className="bg-surface dark:bg-surface-dark items-center rounded-2xl p-6">
        <View className="mb-4 items-center justify-center rounded-full bg-green-500/10 p-5">
          <Ionicons name="checkmark-circle" size={44} color="#16a34a" />
        </View>

        <Text
          className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Download Complete
        </Text>

        <Text
          className="text-muted dark:text-muted-dark mt-1 text-center text-sm px-2"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {totalSelectedItems} {totalSelectedItems === 1 ? "package" : "packages"} downloaded & synced to your device for offline reading.
        </Text>

        <View className="mt-5 w-full border-t border-stone-200/80 pt-4 dark:border-stone-800/80">
          <InfoRow label="Target Year" value={String(year.year)} />
          <InfoRow
            label="Languages"
            value={selectedLanguageNames.join(", ")}
          />
          {selectedVersionLabels.length <= 8 && (
            <View className="mt-2">
              <Text
                className="text-xs text-muted dark:text-muted-dark mb-2"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Synced Packages
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {selectedVersionLabels.map((label) => (
                  <View
                    key={label}
                    className="rounded-lg bg-primary/10 px-2.5 py-1"
                  >
                    <Text
                      className="text-primary text-xs"
                      style={{
                        fontFamily: "ReadingFont",
                        fontWeight: "600",
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {selectedVersionLabels.length > 8 && (
            <InfoRow
              label="Synced Packages"
              value={`${selectedVersionLabels.length} total`}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={onDone}
          activeOpacity={0.7}
          className="bg-primary mt-6 w-full flex-row items-center justify-center gap-2 rounded-xl py-3.5 shadow-sm"
        >
          <Ionicons name="checkmark-sharp" size={18} color="white" />
          <Text
            className="text-center text-base text-white"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default SuccessStep;

