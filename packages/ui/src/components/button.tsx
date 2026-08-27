import * as React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium tracking-tight transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 select-none",
    {
      "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm":
        variant === "default",
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-sm":
        variant === "destructive",
      "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground":
        variant === "outline",
      "bg-secondary text-secondary-foreground hover:bg-secondary/80":
        variant === "secondary",
      "hover:bg-accent hover:text-accent-foreground text-foreground": variant === "ghost",
      "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal":
        variant === "link",
    },
    {
      "h-10 px-4 py-2": size === "default",
      "h-8 px-3 text-xs": size === "sm",
      "h-11 px-6 text-base": size === "lg",
      "h-10 w-10": size === "icon",
    },
    className,
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
