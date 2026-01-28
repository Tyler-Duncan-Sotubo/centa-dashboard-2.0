"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { DailyAttendance } from "../types/daily-attendance.type";

export function useDailyAttendanceQuery() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  const fetchDailyAttendance = async (): Promise<DailyAttendance> => {
    try {
      const res = await axiosAuth.get(
        "/api/clock-in-out/daily-dashboard-stats",
      );
      return res.data.data as DailyAttendance;
    } catch (error) {
      if (isAxiosError(error)) {
        // return a safe empty shape to avoid UI crash
        return {
          details: {} as any,
          metrics: {} as any,
          summaryList: [],
        };
      }
      throw error;
    }
  };

  return useQuery<DailyAttendance>({
    queryKey: ["attendance"],
    queryFn: fetchDailyAttendance,
    enabled: !!session?.backendTokens?.accessToken,
  });
}
