"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";

export function useShiftCalendarWeek() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const weekEnd = useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart],
  );
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd],
  );

  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(weekEnd, "yyyy-MM-dd");

  const handlePrevWeek = () => setWeekStart((d) => subDays(d, 7));
  const handleNextWeek = () => setWeekStart((d) => addDays(d, 7));

  return {
    weekStart,
    weekEnd,
    days,
    startStr,
    endStr,
    handlePrevWeek,
    handleNextWeek,
  };
}
