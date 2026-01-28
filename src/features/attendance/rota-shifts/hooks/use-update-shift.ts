"use client";

import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function useUpdateShift(id: string | undefined) {
  const update = useUpdateMutation({
    endpoint: `/api/shifts/${id}`,
    successMessage: "Shift updated",
    refetchKey: "employee-shifts",
  });

  return { updateShift: update };
}
