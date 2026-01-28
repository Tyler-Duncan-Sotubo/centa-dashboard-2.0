"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { Employee } from "@/types/employees.type";

export function useEmployees(searchTerm?: string, enabled?: boolean) {
  const { data: session, status: sessionStatus } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<Employee[]>({
    queryKey: ["employees"],
    enabled: enabled ?? Boolean(session?.backendTokens?.accessToken),
    queryFn: async () => {
      try {
        const res = await axios.get("/api/employees");
        return (res.data.data ?? []) as Employee[];
      } catch (err) {
        if (isAxiosError(err) && err.response) return [];
        throw err;
      }
    },
  });

  const activeEmployees = useMemo(
    () => (query.data ?? []).filter((e) => e.employmentStatus === "active"),
    [query.data],
  );

  const filteredEmployees = useMemo(() => {
    const term = (searchTerm ?? "").trim().toLowerCase();
    if (!term) return activeEmployees;

    return activeEmployees.filter((emp) =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term),
    );
  }, [activeEmployees, searchTerm]);

  return { sessionStatus, ...query, activeEmployees, filteredEmployees };
}
