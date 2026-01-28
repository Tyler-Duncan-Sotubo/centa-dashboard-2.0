"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { AssetSettings } from "../types/asset-settings.type";

export function useAssetSettingsQuery() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();

  const fetchSettings = async (): Promise<AssetSettings> => {
    const res = await axiosAuth.get("/api/asset-settings");
    return res.data.data as AssetSettings;
  };

  return useQuery<AssetSettings>({
    queryKey: ["asset-approval-settings"],
    queryFn: fetchSettings,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });
}
