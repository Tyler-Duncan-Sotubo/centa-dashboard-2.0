"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { Leave } from "@/features/leave/types/leave.type";

export function useLeaveRequest(id?: string, enabled?: boolean) {
  const { data: session, status: sessionStatus } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<Leave>({
    queryKey: ["leave-request", id],
    enabled:
      enabled ?? (Boolean(session?.backendTokens?.accessToken) && Boolean(id)),
    queryFn: async () => {
      if (!id) throw new Error("Missing leave request id");

      try {
        const res = await axios.get(`/api/leave-request/${id}`);
        return res.data.data as Leave;
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          // keep behavior predictable
          throw new Error(
            err.response.data?.message ?? "Failed to load request",
          );
        }
        throw err;
      }
    },
  });

  return { sessionStatus, ...query };
}
