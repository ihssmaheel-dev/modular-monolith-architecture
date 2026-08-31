import type { LucideIcon } from "lucide-react";

export type FlowLayer = "Presentation" | "Application" | "Domain" | "Infrastructure" | "Background";

export interface PipelineStep {
  stepNumber: number;
  title: string;
  layer: FlowLayer;
  icon: LucideIcon;
  description: string;
  file: string;
  output: string;
}

export const LAYER_THEMES: Record<
  FlowLayer,
  { bg: string; text: string; badge: string; border: string }
> = {
  Presentation: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    badge: "border-blue-500/30 text-blue-500 bg-blue-500/5",
    border: "hover:border-blue-500/50",
  },
  Application: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    badge: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
    border: "hover:border-emerald-500/50",
  },
  Domain: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    badge: "border-amber-500/30 text-amber-500 bg-amber-500/5",
    border: "hover:border-amber-500/50",
  },
  Infrastructure: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    badge: "border-purple-500/30 text-purple-500 bg-purple-500/5",
    border: "hover:border-purple-500/50",
  },
  Background: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    badge: "border-rose-500/30 text-rose-500 bg-rose-500/5",
    border: "hover:border-rose-500/50",
  },
};
