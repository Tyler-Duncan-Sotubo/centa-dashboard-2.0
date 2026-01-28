"use client";

import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function useExpenseApprovalAction(
  expenseId: string,
  action: "approved" | "rejected",
) {
  return useUpdateMutation({
    endpoint: `/api/expenses/${expenseId}/approve`,
    successMessage: `Expense ${action === "approved" ? "approved" : "rejected"}`,
    refetchKey: "expenses",
  });
}
