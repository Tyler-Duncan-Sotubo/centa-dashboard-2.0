"use client";

import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";

export function useDeleteOfficeLocation(id: string) {
  const deleteOfficeLocation = useDeleteMutation({
    endpoint: `/api/locations/${id}`,
    successMessage: "Office location deleted successfully",
    refetchKey: "office-locations",
  });

  return { deleteOfficeLocation };
}
