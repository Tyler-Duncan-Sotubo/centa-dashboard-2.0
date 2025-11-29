import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DateInput({
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
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 opacity-50" />
          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[99999] w-auto p-0" align="start">
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
    </Popover>
  );
}
