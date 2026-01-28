"use client";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";
import type {
  AssetSettingsUpdateKey,
  AssetSettings,
} from "../types/asset-settings.type";

export function useAssetSettingsUpdate() {
  const axiosAuth = useAxiosAuth();
  const { toast } = useToast();

  const updateAssetSetting = async (
    key: AssetSettingsUpdateKey,
    value: boolean | string[],
    onErrorRevert?: () => void,
  ) => {
    try {
      await axiosAuth.patch("/api/asset-settings/update-asset-setting", {
        key,
        value,
      });

      toast({ title: "Setting updated successfully", variant: "success" });
      return true;
    } catch {
      toast({ title: "Failed to update setting", variant: "destructive" });
      onErrorRevert?.();
      return false;
    }
  };

  return { updateAssetSetting };
}
