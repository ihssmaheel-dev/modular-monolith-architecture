import { z } from "zod";

const colorValue = z.string().min(1);
const hexValue = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const semanticColors = z.object({
  background: colorValue,
  foreground: colorValue,
  card: colorValue,
  "card-foreground": colorValue,
  popover: colorValue,
  "popover-foreground": colorValue,
  primary: colorValue,
  "primary-foreground": colorValue,
  secondary: colorValue,
  "secondary-foreground": colorValue,
  muted: colorValue,
  "muted-foreground": colorValue,
  accent: colorValue,
  "accent-foreground": colorValue,
  destructive: colorValue,
  "destructive-foreground": colorValue.optional(),
  border: colorValue,
  input: colorValue,
  ring: colorValue,
  "chart-1": colorValue,
  "chart-2": colorValue,
  "chart-3": colorValue,
  "chart-4": colorValue,
  "chart-5": colorValue,
  sidebar: colorValue,
  "sidebar-foreground": colorValue,
  "sidebar-primary": colorValue,
  "sidebar-primary-foreground": colorValue,
  "sidebar-accent": colorValue,
  "sidebar-accent-foreground": colorValue,
  "sidebar-border": colorValue,
  "sidebar-ring": colorValue,
});

export const tokensSchema = z.object({
  version: z.number().int().min(1).default(1),
  radius: z.string().regex(/^\d+(\.\d+)?rem$/),
  fonts: z.object({
    sans: z.string().min(1),
    heading: z.string().min(1),
    mono: z.string().min(1),
  }),
  shadows: z.object({
    layered: z.string().min(1),
    "layered-strong": z.string().min(1),
    modal: z.string().min(1),
  }),
  brand: z.object({
    purple: hexValue,
    pink: hexValue,
    blue: hexValue,
    orange: hexValue,
    green: hexValue,
    info: hexValue,
    warning: hexValue,
    success: hexValue,
  }),
  light: semanticColors,
  dark: semanticColors,
});

export type Tokens = z.infer<typeof tokensSchema>;
export type SemanticColors = z.infer<typeof semanticColors>;
