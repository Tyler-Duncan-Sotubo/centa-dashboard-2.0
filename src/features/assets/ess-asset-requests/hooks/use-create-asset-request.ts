"use client";

import { useRouter } from "next/navigation";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import type { CreateAssetRequestPayload } from "../types/asset-request.type";

export function useCreateAssetRequest() {
  const router = useRouter();

  const createAssetRequest = useCreateMutation<CreateAssetRequestPayload>({
    endpoint: "/api/asset-requests",
    successMessage: "Asset request submitted",
    refetchKey: "asset-requests",
    onSuccess: () => router.push("/ess/assets"),
  });

  return { createAssetRequest };
}
