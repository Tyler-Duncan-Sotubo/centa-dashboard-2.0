import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./input";

export function DateTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedDate =
    typeof value === "string" && value
      ? parse(value, "yyyy-MM-dd", new Date()) // ✅ correct local date parsing
      : null;

  return (
    <div className="flex gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-99999 w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                const formatted = format(date, "yyyy-MM-dd"); // ✅ keep consistent local-only format
                onChange(formatted);
                setOpen(false);
              }
            }}
            disabled={(date) =>
              date > new Date("2100-01-01") || date < new Date("1900-01-01")
            }
          />
        </PopoverContent>
        <Input
          type="time"
          id="time-picker"
          step="1"
          defaultValue="10:30:00"
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Popover>
    </div>
  );
}
