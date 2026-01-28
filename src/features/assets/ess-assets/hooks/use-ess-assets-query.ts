"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { Asset } from "@/features/assets/core/types/asset.type";

export function useEssAssetsQuery() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<Asset[]>({
    queryKey: ["assets", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get(
          `/api/assets/employee/${session?.user.id}`,
        );
        return res.data.data as Asset[];
      } catch (err) {
        if (isAxiosError(err))
          console.error("Asset fetch failed:", err.response?.data);
        else console.error("Unexpected error:", err);
        return [];
      }
    },
  });
}
