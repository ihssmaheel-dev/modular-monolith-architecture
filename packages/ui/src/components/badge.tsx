import * as React from "react";
import { cn } from "../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "info"
    | "warning"
    | "success"
    | "purple"
    | "pink"
    | "blue"
    | "orange"
    | "green";
  pill?: boolean;
}

function Badge({ className, variant = "default", pill = false, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors focus:outline-none select-none",
        pill ? "rounded-full" : "rounded-sm",
        {
          "bg-primary text-primary-foreground": variant === "default",
          "bg-secondary text-secondary-foreground": variant === "secondary",
          "bg-destructive text-destructive-foreground": variant === "destructive",
          "border border-border text-foreground bg-card": variant === "outline",
          "bg-[#146ef5] text-white": variant === "info",
          "bg-[#ffae13] text-black font-semibold": variant === "warning",
          "bg-[#00d722] text-black font-semibold": variant === "success",
          // 5-stop chromatic category accents
          "bg-accent-purple text-white": variant === "purple",
          "bg-accent-pink text-white": variant === "pink",
          "bg-accent-blue text-white": variant === "blue",
          "bg-accent-orange text-white": variant === "orange",
          "bg-accent-green text-foreground font-semibold": variant === "green",
        },
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
