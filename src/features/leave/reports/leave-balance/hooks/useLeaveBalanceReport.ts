"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { LeaveBalance } from "@/features/leave/types/leave.type";

export type LeaveBalanceReportResponse = {
  leaveBalances: LeaveBalance[];
};

const EMPTY: LeaveBalanceReportResponse = { leaveBalances: [] };

export function useLeaveBalanceReport() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-balance-report"],
    enabled: Boolean(token),
    queryFn: async (): Promise<LeaveBalanceReportResponse> => {
      try {
        const res = await axiosInstance.get(
          "/api/leave-reports/balance-report",
        );
        return res.data?.data ?? EMPTY;
      } catch (error) {
        // keep UI stable; no throws, no crashes
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  return {
    BalanceStatus: query.status,
    ...query,
  };
}
