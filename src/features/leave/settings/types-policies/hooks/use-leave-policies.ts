"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { LeavePolicy } from "@/features/leave/types/leave.type";

export function useLeavePolicies() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery<LeavePolicy[]>({
    queryKey: ["leave-policies"],
    enabled: Boolean(token),
    refetchOnMount: true,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/api/leave-policy");
        return res.data?.data ?? [];
      } catch (error) {
        if (isAxiosError(error) && error.response) return [];
        return [];
      }
    },
  });

  return { ...query };
}
