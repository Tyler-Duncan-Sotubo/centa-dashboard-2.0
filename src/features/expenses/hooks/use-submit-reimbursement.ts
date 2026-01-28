"use client";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function useCreateReimbursement() {
  return useCreateMutation({
    endpoint: "/api/expenses",
    successMessage: "Reimbursement request submitted successfully!",
    refetchKey: "reimbursements",
  });
}

export function useUpdateReimbursement(id: string) {
  return useUpdateMutation({
    endpoint: `/api/expenses/${id}`,
    successMessage: "Reimbursement request updated",
    refetchKey: "reimbursements",
  });
}
