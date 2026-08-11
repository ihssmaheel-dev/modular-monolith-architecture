import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return (
    <SafeAreaView className={`flex-1 bg-background ${className ?? ""}`}>{children}</SafeAreaView>
  );
}
