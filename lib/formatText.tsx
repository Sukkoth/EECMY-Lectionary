import React from "react";
import { Text, type TextStyle, useColorScheme } from "react-native";

/**
 * Strips formatting tags (<v>1</v>, <v>1</>, <red>...</red>) into clean plain text
 * for use in share actions, system notifications, or clipboard copy.
 */
export function stripFormattedTags(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // Replace <v>12</v> or <v>12</> with "12 "
    .replace(/<v>([^<]+)<\/(?:v>|>)/gi, "$1 ")
    // Strip <red> and </red>
    .replace(/<\/?red>/gi, "")
    // Normalize extra spaces
    .replace(/\s+/g, " ")
    .trim();
}

export interface FormattedTextProps {
  text?: string | null;
  style?: TextStyle | TextStyle[];
  className?: string;
  fontSize?: number;
  numberOfLines?: number;
}

/**
 * React Native component that formats verse numbers (<v>1</v> or <v>1</>) and words of Jesus (<red>...</red>)
 * seamlessly inside parent typography styles with native text justification support.
 */
export function FormattedText({
  text,
  style,
  className,
  fontSize = 18,
  numberOfLines,
}: FormattedTextProps) {
  const isDark = useColorScheme() === "dark";

  if (!text) return null;

  // Pattern matching <v>...</v> or <v>...</> OR <red>...</red>
  const regex = /(<v>[^<]+<\/(?:v>|>))|(<red>[\s\S]*?<\/red>)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  const verseFontSize = Math.max(13, Math.round(fontSize * 0.8));
  const verseColor = isDark ? "#60a5fa" : "#3b82f6";
  const redColor = isDark ? "#ef4444" : "#dc2626";

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const [_, vMatch, redMatch] = match;

    if (vMatch) {
      const verseNum = vMatch.replace(/<v>|<\/(?:v>|>)/gi, "").trim();
      parts.push(
        <Text
          key={keyIndex++}
          style={{
            fontSize: verseFontSize,
            fontWeight: "600",
            color: verseColor,
            fontFamily: "ReadingFont",
          }}
        >
          {verseNum}
        </Text>
      );
      parts.push(" ");
    } else if (redMatch) {
      const redContent = redMatch.replace(/<\/?red>/gi, "");
      parts.push(
        <Text
          key={keyIndex++}
          style={{
            color: redColor,
          }}
        >
          {parseInnerContent(redContent, verseFontSize, verseColor, keyIndex++)}
        </Text>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <Text
      style={style}
      className={className}
      numberOfLines={numberOfLines}
      textBreakStrategy="simple"
    >
      {parts}
    </Text>
  );
}

function parseInnerContent(
  content: string,
  verseFontSize: number,
  verseColor: string,
  parentKey: number
): React.ReactNode {
  const vRegex = /<v>([^<]+)<\/(?:v>|>)/gi;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let vMatch: RegExpExecArray | null;
  let subKey = 0;

  while ((vMatch = vRegex.exec(content)) !== null) {
    if (vMatch.index > lastIdx) {
      parts.push(content.substring(lastIdx, vMatch.index));
    }
    const verseNum = vMatch[1].trim();
    parts.push(
      <Text
        key={`${parentKey}-${subKey++}`}
        style={{
          fontSize: verseFontSize,
          fontWeight: "600",
          color: verseColor,
          fontFamily: "ReadingFont",
        }}
      >
        {verseNum}
      </Text>
    );
    parts.push(" ");
    lastIdx = vRegex.lastIndex;
  }

  if (lastIdx < content.length) {
    parts.push(content.substring(lastIdx));
  }

  return parts;
}
