import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

function AlignmentIndicator({ align, active }: { align: TextAlignment; active: boolean }) {
  const isDark = useColorScheme() === "dark";
  const color = active ? "#3b82f6" : isDark ? "#737373" : "#A3A3A3";

  if (align === "left") {
    return (
      <View style={{ width: 24, height: 18, justifyContent: "space-around", alignItems: "flex-start" }}>
        <View style={{ width: "100%", height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: "70%", height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: "85%", height: 2, backgroundColor: color, borderRadius: 1 }} />
      </View>
    );
  }
  if (align === "center") {
    return (
      <View style={{ width: 24, height: 18, justifyContent: "space-around", alignItems: "center" }}>
        <View style={{ width: "100%", height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: "70%", height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: "85%", height: 2, backgroundColor: color, borderRadius: 1 }} />
      </View>
    );
  }
  return (
    <View style={{ width: 24, height: 18, justifyContent: "space-around" }}>
      <View style={{ width: "100%", height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: "100%", height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: "100%", height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

function SizeControl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? "#E8E4DC" : "#2D2A24";

  const dec = () => onChange(Math.max(FONT_MIN, value - FONT_STEP));
  const inc = () => onChange(Math.min(FONT_MAX, value + FONT_STEP));

  return (
    <View className="flex-row items-center justify-between py-3">
      <Text
        className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={dec} activeOpacity={0.6} disabled={value <= FONT_MIN}>
          <Ionicons
            name="remove-circle-outline"
            size={28}
            color={value <= FONT_MIN ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"}
          />
        </TouchableOpacity>
        <Text
          className="text-lg min-w-[32px] text-center"
          style={{ fontFamily: "ReadingFont", fontWeight: "600", color: textColor }}
        >
          {value}
        </Text>
        <TouchableOpacity onPress={inc} activeOpacity={0.6} disabled={value >= FONT_MAX}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={value >= FONT_MAX ? (isDark ? "#525252" : "#D4D4D4") : "#3b82f6"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AlignControl({ label, value, onChange }: { label: string; value: TextAlignment; onChange: (v: TextAlignment) => void }) {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-row items-center justify-between py-3">
      <Text
        className="text-base text-[#2D2A24] dark:text-[#E8E4DC]"
        style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
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
              className={`rounded-lg border px-4 py-2 ${
                active
                  ? "border-blue-500 bg-blue-500/10"
                  : isDark
                    ? "border-stone-700"
                    : "border-stone-200"
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
  /** "settings" = full UI (both views, labeled controls). "simple"/"expanded" = minimal layout for that view only. */
  viewType: "settings" | "simple" | "expanded";
};

export default function FontAlignmentContent({ viewType }: FontAlignmentContentProps) {
  const { settings, setAllSettings } = useSettings();
  const isDark = useColorScheme() === "dark";

  if (viewType === "settings") {
    const update = (partial: Partial<typeof settings>) => {
      setAllSettings({ ...settings, ...partial });
    };

    return (
      <View className="px-6">
        <View className="px-6 pb-4">
          <Text
            className="text-center text-xl text-[#2D2A24] dark:text-[#E8E4DC]"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Select Font Size & Indent
          </Text>
          <Text
            className="text-muted dark:text-muted-dark mt-1 text-center text-sm"
            style={{ fontFamily: "ReadingFont", fontWeight: "400" }}
          >
            Choose how you want the fonts to be displayed
          </Text>
        </View>

        {/* Font Size */}
        <View className="pt-2">
          <Text
            className="text-primary text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Font Size
          </Text>
          <SizeControl
            label="For Short Readings"
            value={settings.fontSizeSimple}
            onChange={(v) => update({ fontSizeSimple: v })}
          />
          <SizeControl
            label="For Sunday Readings"
            value={settings.fontSizeExpanded}
            onChange={(v) => update({ fontSizeExpanded: v })}
          />
        </View>

        {/* Divider */}
        <View className="mx-6 my-2 h-px bg-stone-200 dark:bg-stone-700" />

        {/* Text Alignment */}
        <View className="pb-4 pt-2">
          <Text
            className="text-primary text-xs uppercase tracking-widest"
            style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
          >
            Text Alignment
          </Text>
          <AlignControl
            label="For Short Readings"
            value={settings.alignSimple}
            onChange={(v) => update({ alignSimple: v })}
          />
          <AlignControl
            label="For Sunday Readings"
            value={settings.alignExpanded}
            onChange={(v) => update({ alignExpanded: v })}
          />
        </View>
      </View>
    );
  }

  // Minimal layout for "simple" or "expanded" view
  const isSimple = viewType === "simple";
  const fontSize = isSimple ? settings.fontSizeSimple : settings.fontSizeExpanded;
  const align = isSimple ? settings.alignSimple : settings.alignExpanded;

  const updateFont = (v: number) => {
    setAllSettings({ ...settings, ...(isSimple ? { fontSizeSimple: v } : { fontSizeExpanded: v }) });
  };

  const updateAlign = (v: TextAlignment) => {
    setAllSettings({ ...settings, ...(isSimple ? { alignSimple: v } : { alignExpanded: v }) });
  };

  return (
    <View className="px-6">
      {/* Font Size Row */}
      <View className="flex-row items-center justify-between py-3">
        <Text
          className="text-xs uppercase tracking-widest text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
        >
          Font Size
        </Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => updateFont(Math.max(FONT_MIN, fontSize - FONT_STEP))}
            activeOpacity={0.6}
            disabled={fontSize <= FONT_MIN}
            className="rounded-xl border border-stone-200 px-4 py-2 dark:border-stone-700"
          >
            <Text
              className="text-base"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
                color: fontSize <= FONT_MIN ? (isDark ? "#525252" : "#D4D4D4") : isDark ? "#E8E4DC" : "#2D2A24",
              }}
            >
              A−
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateFont(Math.min(FONT_MAX, fontSize + FONT_STEP))}
            activeOpacity={0.6}
            disabled={fontSize >= FONT_MAX}
            className="rounded-xl border border-stone-200 px-4 py-2 dark:border-stone-700"
          >
            <Text
              className="text-base"
              style={{
                fontFamily: "ReadingFont",
                fontWeight: "600",
                color: fontSize >= FONT_MAX ? (isDark ? "#525252" : "#D4D4D4") : isDark ? "#E8E4DC" : "#2D2A24",
              }}
            >
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View className="my-2 h-px bg-stone-200 dark:bg-stone-700" />

      {/* Alignment Row */}
      <View className="flex-row items-center justify-between py-3">
        <Text
          className="text-xs uppercase tracking-widest text-[#2D2A24] dark:text-[#E8E4DC]"
          style={{ fontFamily: "ReadingFont", fontWeight: "600" }}
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
                className={`rounded-lg border px-3 py-2 ${
                  active
                    ? "border-blue-500 bg-blue-500/10"
                    : isDark
                      ? "border-stone-700"
                      : "border-stone-200"
                }`}
              >
                <AlignmentIndicator align={a.value} active={active} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
