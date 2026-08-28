import * as React from "react";
import { cn } from "@repo/ui";

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl space-y-6", className)}>{children}</div>;
}
