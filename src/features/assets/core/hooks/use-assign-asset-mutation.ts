"use client";

import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import type { AssignAssetPayload } from "../types/assign-asset.type";

export function useAssignAssetMutation(
  assetId: string,
  onSuccess?: () => void,
) {
  const assign = useUpdateMutation<AssignAssetPayload>({
    endpoint: `/api/assets/${assetId}`,
    successMessage: "Asset updated",
    refetchKey: "assets",
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { assign };
}
