"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

export type LeaveEligibilityDaysSettings = {
  allowUnconfirmedLeave: boolean;
  allowedLeaveTypesForUnconfirmed: string[];
  excludeWeekends: boolean;
  weekendDays: string[];
  excludePublicHolidays: boolean;
};

const EMPTY: LeaveEligibilityDaysSettings = {
  allowUnconfirmedLeave: false,
  allowedLeaveTypesForUnconfirmed: [],
  excludeWeekends: false,
  weekendDays: [],
  excludePublicHolidays: false,
};

export function useLeaveEligibilityDaysSettings() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-eligibility-days-settings"],
    enabled: Boolean(token),
    queryFn: async (): Promise<LeaveEligibilityDaysSettings> => {
      try {
        const res = await axiosInstance.get(
          "/api/leave-settings/eligibility-options",
        );
        return res.data?.data ?? EMPTY;
      } catch (error) {
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  const updateSetting = async (
    key: string,
    value: string | number | boolean | string[],
  ) => {
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
