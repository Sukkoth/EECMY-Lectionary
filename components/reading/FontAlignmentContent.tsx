import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { useSettings } from "@/lib/SettingsContext";
import type { TextAlignment } from "@/lib/settings";
import { useTranslation } from "@/lib/i18n";

const FONT_MIN = 14;
const FONT_MAX_SIMPLE = 32;
const FONT_MAX_EXPANDED = 32;
const FONT_STEP = 2;

const ALIGNMENTS: { value: TextAlignment }[] = [
  { value: "left" },
  { value: "center" },
  { value: "justify" },
];

function AlignmentIndicator({
  align,
  active,
  size = 24,
}: {
  align: TextAlignment;
  active: boolean;
  size?: number;
}) {
  const isDark = useColorScheme() === "dark";
  const color = active ? "#3b82f6" : isDark ? "#A3A3A3" : "#6B6560";

  const iconName =
    align === "left"
      ? "align-left"
      : align === "center"
        ? "align-center"
        : "align-justify";

  return <Feather name={iconName} size={size} color={color} />;
}

function SizeControl({
  label,
  value,
  onChange,
  max = FONT_MAX_SIMPLE,
  min = FONT_MIN,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
}) {
  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? "#E8E4DC" : "#2D2A24";

  const dec = () => onChange(Math.max(min, value - FONT_STEP));
  const inc = () => onChange(Math.min(max, value + FONT_STEP));

  return (
    <View className="flex-row items-center justify-between py-2.5">
      <Text
        className="text-base font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={dec}
          activeOpacity={0.6}
          disabled={value <= min}
          className="p-1"
        >
          <Ionicons
            name="remove-circle-outline"
            size={34}
            color={
              value <= min ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"
            }
          />
        </TouchableOpacity>
        <Text
          className="min-w-[44px] text-center text-lg font-semibold"
          style={{ fontFamily: "ReadingFont", color: textColor }}
        >
          {value}pt
        </Text>
        <TouchableOpacity
          onPress={inc}
          activeOpacity={0.6}
          disabled={value >= max}
          className="p-1"
        >
          <Ionicons
            name="add-circle-outline"
            size={34}
            color={
              value >= max ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"
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
    <View className="flex-row items-center justify-between py-2.5">
      <Text
        className="text-base font-medium text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        {ALIGNMENTS.map((a) => {
          const active = value === a.value;
          return (
            <TouchableOpacity
              key={a.value}
              onPress={() => onChange(a.value)}
              activeOpacity={0.6}
              className={`rounded-2xl border px-4 py-2.5 ${
                active
                  ? "border-blue-500 bg-blue-500/15"
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
  const { t } = useTranslation();
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
            {t("fontAndAlignment")}
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-center text-xs font-normal"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("customizeReaderText")}
          </Text>
        </View>

        {/* Font Size Card */}
        <View className="will-change-variable bg-surface dark:bg-surface-dark mb-4 rounded-2xl border border-stone-200/60 p-5 dark:border-stone-800/60">
          <Text
            className="text-primary mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("fontSize")}
          </Text>
          <SizeControl
            label={t("singleReading")}
            value={settings.fontSizeSimple}
            max={FONT_MAX_SIMPLE}
            min={FONT_MIN}
            onChange={(v) => update({ fontSizeSimple: v })}
          />
          <View className="my-1 border-b border-stone-200/40 dark:border-stone-800/40" />
          <SizeControl
            label={t("sundayReadings")}
            value={settings.fontSizeExpanded}
            max={FONT_MAX_EXPANDED}
            min={FONT_MIN}
            onChange={(v) => update({ fontSizeExpanded: v })}
          />
        </View>

        {/* Text Alignment Card */}
        <View className="will-change-variable bg-surface dark:bg-surface-dark mb-4 rounded-2xl border border-stone-200/60 p-5 dark:border-stone-800/60">
          <Text
            className="text-primary mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ fontFamily: "ReadingFont" }}
          >
            {t("textAlignment")}
          </Text>
          <AlignControl
            label={t("singleReading")}
            value={settings.alignSimple}
            onChange={(v) => update({ alignSimple: v })}
          />
          <View className="my-1 border-b border-stone-200/40 dark:border-stone-800/40" />
          <AlignControl
            label={t("sundayReadings")}
            value={settings.alignExpanded}
            onChange={(v) => update({ alignExpanded: v })}
          />
        </View>
      </View>
    );
  }

  // Minimal layout for "simple" or "expanded" view in reader bottom sheet
  const isSimple = viewType === "simple";
  const maxFont = isSimple ? FONT_MAX_SIMPLE : FONT_MAX_EXPANDED;
  const fontSize = isSimple
    ? settings.fontSizeSimple
    : settings.fontSizeExpanded;
  const align = isSimple ? settings.alignSimple : settings.alignExpanded;

  const updateFont = (v: number) => {
    setAllSettings({
      ...settings,
      ...(isSimple
        ? { fontSizeSimple: Math.min(maxFont, Math.max(FONT_MIN, v)) }
        : { fontSizeExpanded: Math.min(maxFont, Math.max(FONT_MIN, v)) }),
    });
  };

  const updateAlign = (v: TextAlignment) => {
    setAllSettings({
      ...settings,
      ...(isSimple ? { alignSimple: v } : { alignExpanded: v }),
    });
  };

  return (
    <View className="px-6 pt-2 mb-2">
      {/* Header */}
      <View className="mb-5 items-center justify-center">
        <Text
          className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC] font-semibold"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          {t("fontAndAlignment")}
        </Text>
        <Text
          className="text-muted dark:text-muted-dark mt-1 text-center text-xs font-normal"
          style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
        >
          {t("customizeReaderText")}
        </Text>
      </View>

      {/* Apple Reader Style Unified Capsule Toolbar */}
      <View className="bg-surface dark:bg-surface-dark rounded-2xl border border-stone-200/70 dark:border-stone-800/70 p-3.5 flex-row items-center justify-between">
        {/* Left: Font Stepper Controls (Substantial Square Buttons) */}
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() =>
              updateFont(Math.max(FONT_MIN, fontSize - FONT_STEP))
            }
            activeOpacity={0.7}
            disabled={fontSize <= FONT_MIN}
            className="h-13 w-13 items-center justify-center rounded-2xl bg-bg-warm/80 dark:bg-bg-warm-dark/80 border border-stone-200/60 dark:border-stone-800/60"
          >
            <Text
              className="text-lg font-semibold text-center"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
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
              updateFont(Math.min(maxFont, fontSize + FONT_STEP))
            }
            activeOpacity={0.7}
            disabled={fontSize >= maxFont}
            className="h-13 w-13 items-center justify-center rounded-2xl bg-bg-warm/80 dark:bg-bg-warm-dark/80 border border-stone-200/60 dark:border-stone-800/60"
          >
            <Text
              className="text-2xl font-semibold text-center"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
                color:
                  fontSize >= maxFont
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

        {/* Center Vertical Divider Line */}
        <View className="h-8 w-px bg-stone-200/80 dark:bg-stone-800/80 mx-2" />

        {/* Right: Text Alignment Controls (Substantial Square Buttons) */}
        <View className="flex-row items-center gap-2.5">
          {ALIGNMENTS.map((a) => {
            const active = align === a.value;
            return (
              <TouchableOpacity
                key={a.value}
                onPress={() => updateAlign(a.value)}
                activeOpacity={0.7}
                className={`h-13 w-13 items-center justify-center rounded-2xl border ${
                  active
                    ? "border-primary/50 bg-primary/15"
                    : isDark
                      ? "border-stone-800/60 bg-bg-warm-dark/40"
                      : "border-stone-200/60 bg-bg-warm/40"
                }`}
              >
                <AlignmentIndicator align={a.value} active={active} size={24} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
