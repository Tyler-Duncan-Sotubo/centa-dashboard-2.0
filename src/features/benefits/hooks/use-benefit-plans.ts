"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useBenefitPlans() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["benefits"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/benefit-plan");
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response) return [];
        throw error;
      }
    },
  });

  return {
    plans: query.data ?? [],
    isLoadingBenefits: query.isLoading,
    isErrorBenefits: !!query.error,
    errorBenefits: query.error,
  };
}
