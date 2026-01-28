"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

export type LeaveEntitlementSettingsResponse = {
  defaultAnnualEntitlement: number;
  allowCarryover: boolean;
  carryoverLimit: number;
  allowNegativeBalance: boolean;
};

const EMPTY: LeaveEntitlementSettingsResponse = {
  defaultAnnualEntitlement: 0,
  allowCarryover: false,
  carryoverLimit: 0,
  allowNegativeBalance: false,
};

export function useLeaveEntitlementSettings() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-entitlement-settings"],
    enabled: Boolean(token),
    queryFn: async (): Promise<LeaveEntitlementSettingsResponse> => {
      try {
        const res = await axiosInstance.get("/api/leave-settings/entitlement");
        return res.data?.data ?? EMPTY;
      } catch (error) {
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  const updateSetting = async (
    key: string,
    value: string | number | boolean,
  ) => {
    await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
      key,
      value,
    });
  };

  return { ...query, updateSetting };
}
