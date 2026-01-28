"use client";

import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Props = {
  year: string;
  month: string; // "01"..."12"
  years: string[];
  months: string[]; // "01"..."12"
  onYearChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  yearWidth?: string; // tailwind class e.g. "w-[100px]"
  monthWidth?: string; // tailwind class e.g. "w-[100px]"
};

export function ReportYearMonthSelector({
  year,
  month,
  years,
  months,
  onYearChange,
  onMonthChange,
  yearWidth = "w-[100px]",
  monthWidth = "w-[100px]",
}: Props) {
  return (
    <div className="flex gap-2">
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className={yearWidth}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((yr) => (
            <SelectItem key={yr} value={yr}>
              {yr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className={monthWidth}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {format(new Date(`${year}-${m}-01`), "MMMM")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
