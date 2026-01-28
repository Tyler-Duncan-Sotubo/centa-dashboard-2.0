"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { AssetRequest } from "../types/asset-request.type";

export function useAssetRequestsQuery() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const fetchAssetRequests = async (): Promise<AssetRequest[]> => {
    try {
      const res = await axiosAuth.get("/api/asset-requests");
      return res.data.data as AssetRequest[];
    } catch (error) {
      if (isAxiosError(error)) return [];
      throw error;
    }
  };

  return useQuery<AssetRequest[]>({
    queryKey: ["asset-requests"],
    queryFn: fetchAssetRequests,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });
}
