import { useColorScheme } from "react-native";
import { useUIStore } from "../stores/ui.store";

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { theme: themePreference, setTheme } = useUIStore();

  const theme = themePreference === "system" ? (systemColorScheme ?? "light") : themePreference;

  return { theme, setTheme };
}
