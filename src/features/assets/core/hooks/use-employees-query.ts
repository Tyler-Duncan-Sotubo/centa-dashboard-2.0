"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { Employee } from "@/types/employees.type";

export function useEmployeesQuery() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const fetchEmployees = async (): Promise<Employee[]> => {
    try {
      const res = await axiosAuth.get("/api/employees");
      return res.data.data as Employee[];
    } catch (error) {
      if (isAxiosError(error)) return [];
      throw error;
    }
  };

  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });
}
