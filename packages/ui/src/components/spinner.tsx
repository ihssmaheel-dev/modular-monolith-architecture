import { cn } from "../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
  label: string;
}

function Spinner({ className, size = "default", label, ...props }: SpinnerProps) {
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
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { Spinner };
