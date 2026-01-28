"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export interface LeaveBalanceRow {
  leaveTypeId: string;
  leaveTypeName: string;
  entitlement: number;
  used: number;
  balance: number;
}

export function useLeaveBalance() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const employeeId = session?.user?.id;

  const query = useQuery({
    queryKey: ["leave-balance", employeeId],
    enabled: Boolean(employeeId),
    queryFn: async (): Promise<LeaveBalanceRow[]> => {
      const res = await axiosInstance.get(
        `/api/leave-balance/employee/${employeeId}`,
      );
      return res.data?.data ?? [];
    },
  });

  return { ...query };
}
