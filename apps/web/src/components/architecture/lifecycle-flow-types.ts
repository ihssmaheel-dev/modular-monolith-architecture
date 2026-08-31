import type { LucideIcon } from "lucide-react";

export interface LifecycleStep {
  stepNumber: number;
  stageName: string;
  layer: "Presentation" | "Application" | "Domain" | "Infrastructure" | "Background";
  layerColor: string;
  icon: LucideIcon;
  description: string;
  filesTouched: { path: string; role: string }[];
  output: string;
}
