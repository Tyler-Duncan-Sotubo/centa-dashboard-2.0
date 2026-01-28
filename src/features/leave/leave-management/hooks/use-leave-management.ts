"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { Holiday } from "@/types/holiday.type";
import { Leave, LeaveSummary } from "@/features/leave/types/leave.type";

export interface LeaveManagement {
  holidays?: Holiday[];
  leaveRequests?: Leave[];
  leaveBalances?: LeaveSummary[];
}

export function useLeaveManagement(enabled?: boolean) {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<LeaveManagement>({
    queryKey: ["leave-data"],
    enabled: enabled ?? Boolean(session?.backendTokens?.accessToken),
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      try {
        const res = await axios.get("/api/leave-reports/leave-management");
        return (res.data.data ?? {}) as LeaveManagement;
      } catch (err) {
        if (isAxiosError(err) && err.response) return {};
        throw err;
      }
    },
  });

  return { sessionStatus: status, ...query };
}
