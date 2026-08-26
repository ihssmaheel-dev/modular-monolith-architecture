import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "../lib/utils";

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selected,
  onSelect,
  className,
  minDate,
  maxDate,
}: CalendarProps) {
  const initialDate = selected instanceof Date ? selected : selected?.from || new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(initialDate);

  const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const isSelected = (day: Date) => {
    if (!selected) return false;
    if (selected instanceof Date) return isSameDay(day, selected);
    if (selected.from && isSameDay(day, selected.from)) return true;
    if (selected.to && isSameDay(day, selected.to)) return true;
    if (selected.from && selected.to && day >= selected.from && day <= selected.to) return true;
    return false;
  };

  const isDisabled = (day: Date) => {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  };

  return (
    <div className={cn("p-3 bg-popover text-popover-foreground rounded-md shadow-sm border", className)}>
      <div className="flex items-center justify-between space-x-2 pt-1 pb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-sm hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
        <button
          type="button"
          onClick={nextMonth}
          className="h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-sm hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground pb-2">
        {weekDays.map((d) => (
          <div key={d} className="h-6 flex items-center justify-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const active = isSelected(day);
          const disabled = isDisabled(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(day)}
              className={cn(
                "h-8 w-8 text-center text-sm p-0 rounded-md font-normal transition-colors flex items-center justify-center",
                !isCurrentMonth && "text-muted-foreground opacity-40",
                isToday(day) && !active && "bg-accent text-accent-foreground font-semibold",
                active && "bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
                !active && !disabled && "hover:bg-muted hover:text-foreground",
                disabled && "opacity-25 cursor-not-allowed",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
