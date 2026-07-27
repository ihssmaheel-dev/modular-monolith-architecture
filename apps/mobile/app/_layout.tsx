import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "global.css";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
