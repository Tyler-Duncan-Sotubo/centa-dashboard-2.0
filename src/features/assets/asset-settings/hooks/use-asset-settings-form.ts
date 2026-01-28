"use client";

import { useEffect, useState } from "react";
import type { AssetSettings } from "../types/asset-settings.type";

export function useAssetSettingsForm(settings: AssetSettings | undefined) {
  const [enabled, setEnabled] = useState(false);
  const [approverChain, setApproverChain] = useState<string[]>([]);
  const [fallbackApprovers, setFallbackApprovers] = useState<string[]>([]);

  useEffect(() => {
    if (!settings) return;
    setEnabled(!!settings.multiLevelApproval);
    setApproverChain(settings.approverChain ?? []);
    setFallbackApprovers(settings.fallbackRoles ?? []);
  }, [settings]);

  return {
    enabled,
    setEnabled,
    approverChain,
    setApproverChain,
    fallbackApprovers,
    setFallbackApprovers,
  };
}
