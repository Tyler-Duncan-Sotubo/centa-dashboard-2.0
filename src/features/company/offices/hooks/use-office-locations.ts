"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { officeLocation } from "@/types/location.type";

export function useOfficeLocations() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<officeLocation[]>({
    queryKey: ["office-locations"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axios.get("/api/locations");
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response) return [];
        throw error;
      }
    },
  });

  return {
    status,
    officeLocations: query.data ?? [],
    isLoadingOfficeLocations: query.isLoading,
    isErrorOfficeLocations: !!query.error,
    errorOfficeLocations: query.error,
  };
}
