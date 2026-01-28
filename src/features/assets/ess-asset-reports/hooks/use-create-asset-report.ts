"use client";

import { useRouter } from "next/navigation";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import type { CreateAssetReportPayload } from "../types/asset-report.type";

export function useCreateAssetReport() {
  const router = useRouter();

  const createAssetReport = useCreateMutation<CreateAssetReportPayload>({
    endpoint: "/api/asset-reports",
    successMessage: "Asset report submitted",
    refetchKey: "assets",
    onSuccess: () => router.push("/dashboard/assets"),
  });

  return { createAssetReport };
}
