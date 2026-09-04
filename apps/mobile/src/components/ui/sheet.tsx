import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";
import { Button } from "./button";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => onOpenChange(false)}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={() => onOpenChange(false)}>
        <Pressable
          className="rounded-t-2xl p-6 gap-4"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          {title ? (
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text className="text-sm" style={{ color: colors["muted-foreground"] }}>
              {description}
            </Text>
          ) : null}
          {children}
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            Close
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
