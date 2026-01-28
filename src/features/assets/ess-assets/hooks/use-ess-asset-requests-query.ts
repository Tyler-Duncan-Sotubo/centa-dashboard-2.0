"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function useEssAssetRequestsQuery() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<any[]>({
    queryKey: ["asset-requests", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get(
          `/api/asset-requests/employee/${session?.user.id}`,
        );
        return res.data.data as any[];
      } catch (err) {
        if (isAxiosError(err))
          console.error("Asset request fetch failed:", err.response?.data);
        else console.error("Unexpected error:", err);
        return [];
      }
    },
  });
}
