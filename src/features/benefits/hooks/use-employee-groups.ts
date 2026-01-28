"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useEmployeeGroups(isOpen: boolean) {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["employee-groups"],
    enabled: !!session?.backendTokens?.accessToken && isOpen,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/employee-groups");
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response) return [];
        throw error;
      }
    },
  });

  return {
    teams: query.data ?? [],
    isLoadingTeams: query.isLoading,
    isErrorTeams: !!query.error,
    errorTeams: query.error,
  };
}
