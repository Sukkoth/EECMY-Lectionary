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
      <View className="bg-surface dark:bg-surface-dark items-center rounded-2xl px-6 py-10">
        <View className="mb-4 rounded-full bg-green-500/10 p-4">
          <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
        </View>

        <Text
          className="text-center text-2xl text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Download Complete
        </Text>

        <Text
          className="text-muted dark:text-muted-dark mt-2 text-center text-sm"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {totalSelectedItems} {totalSelectedItems === 1 ? "item" : "items"} downloaded
          successfully.
        </Text>

        <View className="mt-6 w-full border-t border-stone-200 pt-4 dark:border-stone-700">
          <InfoRow label="Year" value={String(year.year)} />
          <InfoRow
            label="Languages"
            value={selectedLanguageNames.join(", ")}
          />
          {selectedVersionLabels.length <= 8 && (
            <View className="mt-1">
              <Text
                className="text-muted dark:text-muted-dark text-sm"
                style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
              >
                Versions
              </Text>
              <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                {selectedVersionLabels.map((label) => (
                  <View
                    key={label}
                    className="rounded-lg bg-primary/10 px-2.5 py-1"
                  >
                    <Text
                      className="text-primary text-xs"
                      style={{
                        fontFamily: "ReadingFont",
                        fontWeight: "500",
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
              label="Versions"
              value={`${selectedVersionLabels.length} total`}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={onDone}
          activeOpacity={0.7}
          className="bg-primary mt-6 w-full rounded-xl py-3.5"
        >
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
