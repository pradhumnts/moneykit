"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDisplayDate,
  parseDateString,
  toDateString,
} from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

/**
 * Date picker using shadcn Calendar + Popover.
 * value / onChange use YYYY-MM-DD strings to match app storage.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDateString(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            data-empty={!value}
            className={cn(
              "min-h-11 w-full justify-between rounded-2xl px-3 font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="truncate">
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (!date) return;
            onChange?.(toDateString(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
