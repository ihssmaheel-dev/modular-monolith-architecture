import type { LucideIcon } from "lucide-react";

export type FlowLayer = "Presentation" | "Application" | "Domain" | "Infrastructure" | "Background";

export interface FlowNodeData {
  step: number;
  title: string;
  layer: FlowLayer;
  description: string;
  file: string;
  icon: LucideIcon;
}

export const LAYER_COLORS: Record<
  FlowLayer,
  { borderLeft: string; bg: string; text: string; dot: string }
> = {
  Presentation: {
    borderLeft: "border-l-blue-500",
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Application: {
    borderLeft: "border-l-emerald-500",
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Domain: {
    borderLeft: "border-l-amber-500",
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Infrastructure: {
    borderLeft: "border-l-purple-500",
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  Background: {
    borderLeft: "border-l-rose-500",
    bg: "bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};
