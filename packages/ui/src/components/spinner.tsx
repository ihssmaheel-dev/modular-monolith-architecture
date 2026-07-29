import { cn } from "../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-8 w-8": size === "lg",
        },
        className,
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Spinner };
