"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { LeaveType } from "@/features/leave/types/leave.type";

export function useLeaveTypes(enabled?: boolean) {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<LeaveType[]>({
    queryKey: ["leave-types"],
    enabled: enabled ?? Boolean(session?.backendTokens?.accessToken),
    refetchOnMount: true,
    queryFn: async () => {
      try {
        const res = await axios.get("/api/leave-types");
        return (res.data.data ?? []) as LeaveType[];
      } catch (err) {
        if (isAxiosError(err) && err.response) return [];
        throw err;
      }
    },
  });

  return { sessionStatus: status, ...query };
}
