"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export type LeaveApprovalSettings = {
  multiLevelApproval: boolean;
  approverChain: string[];
  autoApproveAfterDays: number;
};

const EMPTY: LeaveApprovalSettings = {
  multiLevelApproval: false,
  approverChain: [],
  autoApproveAfterDays: 0,
};

export function useleaveapprovalsettings() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-approval-settings"],
    enabled: Boolean(token),
    queryFn: async (): Promise<LeaveApprovalSettings> => {
      try {
        const res = await axiosInstance.get("/api/leave-settings/approval");
        return res.data?.data ?? EMPTY;
      } catch (error) {
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  const updateSetting = async (key: string, value: unknown) => {
    await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
      key,
      value,
    });
  };

  return {
    ...query,
    updateSetting,
  };
}
