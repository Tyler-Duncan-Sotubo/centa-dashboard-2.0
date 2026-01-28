"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { Asset } from "@/features/assets/core/types/asset.type";

export function useAssetsQuery() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const fetchAssets = async (): Promise<Asset[]> => {
    try {
      const res = await axiosAuth.get("/api/assets");
      return res.data.data as Asset[];
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      throw error;
    }
  };

  return useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: fetchAssets,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });
}
