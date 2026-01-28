"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export interface ApprovalStep {
  id: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  fallbackRoles?: string[];
}

export function useExpenseApprovalSteps(expenseId: string, enabled: boolean) {
  const axios = useAxiosAuth();

  return useQuery<ApprovalStep[]>({
    queryKey: ["expense-approval-steps", expenseId],
    enabled,
    queryFn: async () => {
      const res = await axios.get(`/api/expenses/${expenseId}/approval-status`);
      return res.data?.data?.steps ?? [];
    },
    staleTime: 0,
  });
}
