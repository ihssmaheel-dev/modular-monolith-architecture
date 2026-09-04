import * as React from "react";
import { useColorScheme, View } from "react-native";
import { useThemeStore, type Theme, type ResolvedTheme } from "@/stores/theme.store";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const systemColorScheme = useColorScheme();

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemColorScheme === "dark" ? "dark" : "light") : theme;

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className={resolvedTheme === "dark" ? "dark flex-1" : "flex-1"} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
