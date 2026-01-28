"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { format } from "date-fns";
import type { AttendanceSummaryItem } from "@/features/attendance/core/types/attendance.type";

export function useAttendanceSummaryQuery(
  selectedDate: Date | undefined,
  enabled: boolean,
) {
  const axiosAuth = useAxiosAuth();

  return useQuery<AttendanceSummaryItem[]>({
    queryKey: [
      "attendance-summary",
      selectedDate ? format(selectedDate, "yyyy-MM-dd") : "today",
    ],
    enabled: enabled && !!selectedDate,
    queryFn: async () => {
      try {
        const dateStr = format(selectedDate as Date, "yyyy-MM-dd");
        const res = await axiosAuth.get(
          `/api/clock-in-out/attendance-summary?date=${dateStr}`,
        );
        return (res.data.data?.summaryList ?? []) as AttendanceSummaryItem[];
      } catch (error) {
        if (isAxiosError(error)) return [];
        throw error;
      }
    },
  });
}
