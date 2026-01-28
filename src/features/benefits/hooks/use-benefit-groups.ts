"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useBenefitGroups() {
  const axiosAuth = useAxiosAuth();
  const { data: session, status } = useSession();

  const query = useQuery({
    queryKey: ["benefit-groups"],
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/benefit-groups");
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response) return [];
        throw error;
      }
    },
  });

  return {
    status,
    groups: query.data ?? [],
    isLoadingGroups: query.isLoading,
    isErrorGroups: !!query.error,
    errorGroups: query.error,
  };
}
