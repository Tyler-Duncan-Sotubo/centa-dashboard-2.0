"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { AssetReport } from "@/features/assets/assets-report/types/asset-report.type";

export function useAssetReportsQuery() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const fetchAssetReports = async (): Promise<AssetReport[]> => {
    try {
      const res = await axiosAuth.get("/api/asset-reports");
      return res.data.data as AssetReport[];
    } catch (error) {
      if (isAxiosError(error)) return [];
      throw error;
    }
  };

  return useQuery<AssetReport[]>({
    queryKey: ["asset-reports"],
    queryFn: fetchAssetReports,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });
}
