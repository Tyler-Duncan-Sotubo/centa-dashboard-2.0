"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

// Raw API shape
type ApiHoliday = {
  name: string;
  date: string;
  type: string; // "Public Holiday", "Observance", etc.
};

type ApiLeave = {
  name: string;
  startDate: string;
  endDate: string;
};

// Internal normalized types
type Holiday = {
  id: string;
  name: string;
  date: string;
  type: "Holiday";
  subType: string;
};

type Leave = {
  id: string;
  name: string;
  start: string;
  end: string;
  type: "Leave";
};

type UnifiedEvent =
  | (Holiday & { start?: undefined; end?: undefined })
  | (Leave & { date?: undefined; subType?: undefined });

export default function InteractiveCalendarCard({
  data,
}: {
  data: { allHolidays: ApiHoliday[]; recentLeaves: ApiLeave[] };
}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startOffset = getDay(firstDay);
  const totalCells = Math.ceil((days.length + startOffset) / 7) * 7;

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => {
    const next = addMonths(currentDate, 1);
    const isFuture =
      next.getFullYear() > today.getFullYear() ||
      (next.getFullYear() === today.getFullYear() &&
        next.getMonth() > today.getMonth());
    if (!isFuture) setCurrentDate(next);
  };

  // ✅ Normalize incoming data
  const holidays: Holiday[] = (data.allHolidays ?? []).map((h, idx) => ({
    id: `holiday-${idx}`,
    name: h.name,
    date: h.date,
    type: "Holiday",
    subType: h.type, // e.g. "Public Holiday"
  }));

  const leaves: Leave[] = (data.recentLeaves ?? []).map((l, idx) => ({
    id: `leave-${idx}`,
    name: l.name,
    start: l.startDate,
    end: l.endDate,
    type: "Leave",
  }));

  const unified: UnifiedEvent[] = [
    ...holidays.filter((h) => h.date && isAfter(parseISO(h.date), today)),
    ...leaves.filter((l) => l.start && isAfter(parseISO(l.start), today)),
  ].sort((a, b) => {
    const dateA =
      a.type === "Holiday"
        ? a.date
          ? parseISO(a.date)
          : new Date(0)
        : a.start
          ? parseISO(a.start)
          : new Date(0);
    const dateB =
      b.type === "Holiday"
        ? b.date
          ? parseISO(b.date)
          : new Date(0)
        : b.start
          ? parseISO(b.start)
          : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="w-full p-0">
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand" />
          <CardTitle className="text-base">Calendar</CardTitle>
        </div>
        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-medium">{format(currentDate, "MMMM yyyy")}</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const date = new Date(firstDay);
            date.setDate(date.getDate() + (idx - startOffset));

            const inMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, today);
            const isHoliday = holidays.some((h) =>
              h.date ? isSameDay(parseISO(h.date), date) : false,
            );

            const base =
              "aspect-square flex items-center justify-center rounded-md";
            let classes = "text-muted-foreground";
            if (inMonth) classes = "text-foreground";
            if (isHoliday) classes += " bg-brand/20 text-brand font-semibold";
            if (isToday) classes += " border border-brand font-semibold";

            return (
              <div key={idx} className={`${base} ${classes}`}>
                {format(date, "d")}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h5 className="text-sm font-semibold mb-2 text-foreground">
            Upcoming
          </h5>
          {unified.length ? (
            <ul className="divide-y divide-muted/30 text-sm">
              {unified.map((item) => (
                <li key={item.id} className="py-2 space-y-0.5">
                  <p
                    className={
                      item.type === "Holiday"
                        ? "text-monzo-brand font-semibold"
                        : "text-monzo-success font-semibold"
                    }
                  >
                    {item.type}
                  </p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.type === "Holiday" && item.date
                        ? format(parseISO(item.date), "MMM d, yyyy")
                        : item.start && item.end
                          ? `${format(parseISO(item.start), "MMM d")} – ${format(
                              parseISO(item.end),
                              "MMM d",
                            )}`
                          : "Invalid date"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming holidays or leaves.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
