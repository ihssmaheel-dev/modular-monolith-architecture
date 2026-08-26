import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxDisplay?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search items...",
  emptyText = "No items found.",
  maxDisplay = 3,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggleOption = (val: string) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
    onValueChange(next);
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((v) => v !== val));
  };

  const selectAll = () => onValueChange(options.filter((o) => !o.disabled).map((o) => o.value));
  const clearAll = () => onValueChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("min-h-10 w-full justify-between font-normal h-auto py-1.5 px-3", className)}
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {value.slice(0, maxDisplay).map((v) => {
                  const opt = options.find((o) => o.value === v);
                  return (
                    <Badge key={v} variant="secondary" className="text-xs gap-1 pr-1 font-normal">
                      <span>{opt ? opt.label : v}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeValue(v, e)}
                        onKeyDown={(e) => e.key === "Enter" && removeValue(v, e as unknown as React.MouseEvent)}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  );
                })}
                {value.length > maxDisplay && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{value.length - maxDisplay} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[240px] p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex h-6 w-full rounded-md bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground">
          <button type="button" onClick={selectAll} className="hover:text-foreground">Select all</button>
          <button type="button" onClick={clearAll} className="hover:text-foreground">Clear all</button>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            filtered.map((opt) => {
              const checked = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => toggleOption(opt.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    checked && "bg-accent/40 font-medium",
                    opt.disabled && "pointer-events-none opacity-50",
                  )}
                >
                  <div className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-xs border border-primary",
                    checked ? "bg-primary text-primary-foreground" : "opacity-50",
                  )}>
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
