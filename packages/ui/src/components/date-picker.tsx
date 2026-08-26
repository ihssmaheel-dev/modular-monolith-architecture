import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selected: Date) => {
    onDateChange?.(selected);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{date ? format(date, "PPP") : placeholder}</span>
          {date && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="ml-auto rounded-xs p-0.5 opacity-60 hover:opacity-100 hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface DateRangePickerProps {
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange?: (range: { from?: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (day: Date) => {
    if (!dateRange?.from || (dateRange.from && dateRange.to)) {
      onDateRangeChange?.({ from: day, to: undefined });
    } else if (dateRange.from && !dateRange.to) {
      if (day < dateRange.from) {
        onDateRangeChange?.({ from: day, to: dateRange.from });
      } else {
        onDateRangeChange?.({ from: dateRange.from, to: day });
        setOpen(false);
      }
    }
  };

  const displayText = React.useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`;
    }
    if (dateRange?.from) {
      return `${format(dateRange.from, "LLL dd, y")} - ...`;
    }
    return placeholder;
  }, [dateRange, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
