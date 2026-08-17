import { useColorScheme } from "react-native";
import { useSettings } from "./SettingsContext";

export function useIsDark(): boolean {
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();

  if (settings?.theme) {
    return settings.theme === "dark";
  }
  return systemColorScheme === "dark";
}
