"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useBenefitEnrollments() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const employeeId = session?.user?.id;
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["benefit-enrollments", employeeId],
    enabled: !!employeeId && !!token,
    queryFn: async () => {
      try {
        const res = await axios.get(
          `/api/benefit-plan/enrollments/${employeeId}`,
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) return [];
        throw err;
      }
    },
  });

  return {
    employeeId,
    enrollments: query.data ?? [],
    isLoadingEnrollments: query.isLoading,
    isErrorEnrollments: !!query.error,
    errorEnrollments: query.error,
  };
}
