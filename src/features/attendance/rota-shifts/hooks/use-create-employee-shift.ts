"use client";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";

export function useCreateEmployeeShift(employeeId: string | undefined) {
  const create = useCreateMutation({
    endpoint: `/api/employee-shifts/${employeeId}`,
    successMessage: "Shift created",
    refetchKey: "employee-shifts",
  });

  return { createEmployeeShift: create };
}
