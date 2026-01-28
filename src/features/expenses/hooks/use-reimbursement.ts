"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";

export function useReimbursement(id: string) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["reimbursement", id],
    enabled: Boolean(session?.backendTokens?.accessToken) && Boolean(id),
    queryFn: async () => {
      const res = await axios.get(`/api/expenses/${id}`);
      return res.data.data;
    },
    staleTime: 0,
  });
}
