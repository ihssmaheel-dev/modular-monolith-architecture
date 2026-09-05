import * as React from "react";
import { Text, View } from "react-native";
import { create } from "zustand";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];

  if (toasts.length === 0) return null;

  return (
    <View className="absolute bottom-6 left-4 right-4 gap-2">
      {toasts.map((t) => (
        <View
          key={t.id}
          className="rounded-xl p-4 shadow-lg border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          onTouchEnd={() => remove(t.id)}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.title}</Text>
          {t.description ? (
            <Text style={{ color: colors["muted-foreground"] }}>{t.description}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export const toast = {
  add: (t: Omit<ToastItem, "id">) => useToastStore.getState().add(t),
};
