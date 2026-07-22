import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSettings } from "@/lib/SettingsContext";
import type { TextAlignment } from "@/lib/settings";

const FONT_MIN = 12;
const FONT_MAX = 32;
const FONT_STEP = 2;

const ALIGNMENTS: { value: TextAlignment }[] = [
  { value: "left" },
  { value: "center" },
  { value: "justify" },
];

function AlignmentIndicator({
  align,
  active,
}: {
  align: TextAlignment;
  active: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  const color = active ? "#3b82f6" : isDark ? "#A3A3A3" : "#6B6560";

  const iconName =
    align === "left"
      ? "align-left"
      : align === "center"
        ? "align-center"
        : "align-justify";

  return <Feather name={iconName} size={18} color={color} />;
}

function SizeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? "#E8E4DC" : "#2D2A24";

  const dec = () => onChange(Math.max(FONT_MIN, value - FONT_STEP));
  const inc = () => onChange(Math.min(FONT_MAX, value + FONT_STEP));

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className="text-sm font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={dec}
          activeOpacity={0.6}
          disabled={value <= FONT_MIN}
        >
          <Ionicons
            name="remove-circle-outline"
            size={26}
            color={
              value <= FONT_MIN ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"
            }
          />
        </TouchableOpacity>
        <Text
          className="min-w-[28px] text-center text-base font-semibold"
          style={{ fontFamily: "ReadingFont", color: textColor }}
        >
          {value}pt
        </Text>
        <TouchableOpacity
          onPress={inc}
          activeOpacity={0.6}
          disabled={value >= FONT_MAX}
        >
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={
              value >= FONT_MAX ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AlignControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TextAlignment;
  onChange: (v: TextAlignment) => void;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className="text-sm font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {ALIGNMENTS.map((a) => {
          const active = value === a.value;
          return (
            <TouchableOpacity
              key={a.value}
              onPress={() => onChange(a.value)}
              activeOpacity={0.6}
              className={`rounded-xl border px-3.5 py-2 ${
                active
                  ? "border-blue-500 bg-blue-500/10"
                  : isDark
                    ? "border-stone-800 bg-bg-warm-dark/50"
                    : "border-stone-200 bg-bg-warm/50"
              }`}
            >
              <AlignmentIndicator align={a.value} active={active} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

type FontAlignmentContentProps = {
  viewType: "settings" | "simple" | "expanded";
};

export default function FontAlignmentContent({
  viewType,
}: FontAlignmentContentProps) {
  const { settings, setAllSettings } = useSettings();
  const isDark = useColorScheme() === "dark";

  if (viewType === "settings") {
    const update = (partial: Partial<typeof settings>) => {
      setAllSettings({ ...settings, ...partial });
    };

    return (
      <View className="px-6">
        <View className="mb-4 items-center justify-center">
          <Text
            className="text-center text-xl font-semibold text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont" }}
          >
            Font & Alignment
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-center text-xs font-normal"
            style={{ fontFamily: "ReadingFont" }}
          >
            Customize reader text size and alignment
          </Text>
        </View>

        {/* Font Size Card */}
        <View className="will-change-variable bg-surface dark:bg-surface-dark mb-3 rounded-2xl border border-stone-200/60 p-4 dark:border-stone-800/60">
          <Text
            className="text-primary mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ fontFamily: "ReadingFont" }}
          >
            Font Size
          </Text>
          <SizeControl
            label="Single Reading"
            value={settings.fontSizeSimple}
            onChange={(v) => update({ fontSizeSimple: v })}
          />
          <View className="my-1 border-b border-stone-200/40 dark:border-stone-800/40" />
          <SizeControl
            label="Sunday Readings"
            value={settings.fontSizeExpanded}
            onChange={(v) => update({ fontSizeExpanded: v })}
          />
        </View>

        {/* Text Alignment Card */}
        <View className="will-change-variable bg-surface dark:bg-surface-dark mb-3 rounded-2xl border border-stone-200/60 p-4 dark:border-stone-800/60">
          <Text
            className="text-primary mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ fontFamily: "ReadingFont" }}
          >
            Text Alignment
          </Text>
          <AlignControl
            label="Single Reading"
            value={settings.alignSimple}
            onChange={(v) => update({ alignSimple: v })}
          />
          <View className="my-1 border-b border-stone-200/40 dark:border-stone-800/40" />
          <AlignControl
            label="Sunday Readings"
            value={settings.alignExpanded}
            onChange={(v) => update({ alignExpanded: v })}
          />
        </View>
      </View>
    );
  }

  // Minimal layout for "simple" or "expanded" view in reader bottom sheet
  const isSimple = viewType === "simple";
  const fontSize = isSimple
    ? settings.fontSizeSimple
    : settings.fontSizeExpanded;
  const align = isSimple ? settings.alignSimple : settings.alignExpanded;

  const updateFont = (v: number) => {
    setAllSettings({
      ...settings,
      ...(isSimple ? { fontSizeSimple: v } : { fontSizeExpanded: v }),
    });
  };

  const updateAlign = (v: TextAlignment) => {
    setAllSettings({
      ...settings,
      ...(isSimple ? { alignSimple: v } : { alignExpanded: v }),
    });
  };

  return (
    <View className="px-6">
      <View className="will-change-variable bg-surface dark:bg-surface-dark rounded-2xl border border-stone-200/60 p-4 dark:border-stone-800/60">
        {/* Font Size Row */}
        <View className="flex-row items-center justify-between py-1">
          <Text
            className="text-xs font-semibold uppercase tracking-wider text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont" }}
          >
            Text Size ({fontSize}pt)
          </Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() =>
                updateFont(Math.max(FONT_MIN, fontSize - FONT_STEP))
              }
              activeOpacity={0.6}
              disabled={fontSize <= FONT_MIN}
              className="bg-bg-warm/50 dark:bg-bg-warm-dark/50 rounded-xl border border-stone-200/60 px-3 py-1.5 dark:border-stone-800/60"
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  fontFamily: "ReadingFont",
                  color:
                    fontSize <= FONT_MIN
                      ? isDark
                        ? "#525252"
                        : "#D4D4D4"
                      : isDark
                        ? "#E8E4DC"
                        : "#2D2A24",
                }}
              >
                A−
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                updateFont(Math.min(FONT_MAX, fontSize + FONT_STEP))
              }
              activeOpacity={0.6}
              disabled={fontSize >= FONT_MAX}
              className="bg-bg-warm/50 dark:bg-bg-warm-dark/50 rounded-xl border border-stone-200/60 px-3 py-1.5 dark:border-stone-800/60"
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  fontFamily: "ReadingFont",
                  color:
                    fontSize >= FONT_MAX
                      ? isDark
                        ? "#525252"
                        : "#D4D4D4"
                      : isDark
                        ? "#E8E4DC"
                        : "#2D2A24",
                }}
              >
                A+
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="my-2 border-b border-stone-200/40 dark:border-stone-800/40" />

        {/* Alignment Row */}
        <View className="flex-row items-center justify-between py-1">
          <Text
            className="text-xs font-semibold uppercase tracking-wider text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont" }}
          >
            Indent
          </Text>
          <View className="flex-row items-center gap-2">
            {ALIGNMENTS.map((a) => {
              const active = align === a.value;
              return (
                <TouchableOpacity
                  key={a.value}
                  onPress={() => updateAlign(a.value)}
                  activeOpacity={0.6}
                  className={`rounded-xl border px-3.5 py-2 ${
                    active
                      ? "border-blue-500 bg-blue-500/10"
                      : isDark
                        ? "border-stone-800 bg-bg-warm-dark/50"
                        : "border-stone-200 bg-bg-warm/50"
                  }`}
                >
                  <AlignmentIndicator align={a.value} active={active} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
