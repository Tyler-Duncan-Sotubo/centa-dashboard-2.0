"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useShiftEventsQuery(args: {
  startStr: string;
  endStr: string;
  selectedLocation: string;
}) {
  const { startStr, endStr, selectedLocation } = args;
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<Record<string, any[]>>({
    queryKey: ["employee-shifts", selectedLocation, startStr],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get(
          `/api/employee-shifts/events/calendar?start=${startStr}&end=${endStr}`,
        );
        return res.data.data ?? {};
      } catch (error) {
        if (isAxiosError(error)) return {};
        throw error;
      }
    },
  });
}
