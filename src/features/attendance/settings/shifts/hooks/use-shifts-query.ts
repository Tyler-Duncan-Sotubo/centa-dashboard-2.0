"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { Shift } from "@/types/shift.type";

export function useShiftsQuery() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<Shift[]>({
    queryKey: ["shifts"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/shifts");
        return res.data.data as Shift[];
      } catch (error) {
        if (isAxiosError(error)) return [];
        throw error;
      }
    },
  });
}
