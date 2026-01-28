"use client";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { EmployeeOnboarding } from "@/types/onboarding.type";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useOnboardingData() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const employeeId = session?.user?.id;

  const enabled = !!employeeId && !!session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["onboarding", employeeId],
    enabled,
    queryFn: async () => {
      const res = await axiosInstance(
        `/api/onboarding/employees-onboarding/${employeeId}`,
      );

      return res.data.data as EmployeeOnboarding;
    },
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}
