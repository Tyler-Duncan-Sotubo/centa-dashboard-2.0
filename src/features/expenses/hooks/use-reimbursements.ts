"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export type Reimbursement = {
  id: string;
  purpose: string;
  category: string;
  amount: string;
  status: string;
  createdAt: string;
  receiptUrl?: string | null;
  paymentMethod: string;
  rejectionReason?: string | null;
};

export function useReimbursements() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  return useQuery<Reimbursement[]>({
    queryKey: ["reimbursements"],
    enabled:
      Boolean(session?.backendTokens?.accessToken) &&
      Boolean(session?.user?.id),
    queryFn: async () => {
      const res = await axios.get(`/api/expenses/employee/${session!.user.id}`);
      return res.data.data ?? [];
    },
    staleTime: 0,
  });
}
