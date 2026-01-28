"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

export type LeaveUtilizationReportResponse = {
  leaveUtilization: unknown[]; // replace with real types if you have them
  departmentUsage: unknown[]; // replace with real types if you have them
};

const EMPTY: LeaveUtilizationReportResponse = {
  leaveUtilization: [],
  departmentUsage: [],
};

export function useLeaveUtilizationReport(groupBy: "year" | "month" = "year") {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-utils-report", groupBy],
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/leave-reports/utilization-report?groupBy=${groupBy}`,
        );
        return res.data?.data ?? EMPTY;
      } catch (error) {
        // keep UI stable; avoid throws/crashes
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  return { leaveStatus: query.status, ...query };
}
