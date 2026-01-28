"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

export type LeaveNotificationSettingsData = {
  notifyHr: boolean;
  notifyApprover: boolean;
  notifyLineManager: boolean;
  notifyEmployeeOnDecision: boolean;
  notificationCcRoles: string[];
  notificationChannels: string[];
};

export type LeaveNotificationSettingsResponse = {
  notifications: LeaveNotificationSettingsData;
};

const EMPTY_NOTIFICATIONS: LeaveNotificationSettingsData = {
  notifyHr: false,
  notifyApprover: false,
  notifyLineManager: false,
  notifyEmployeeOnDecision: false,
  notificationCcRoles: [],
  notificationChannels: [],
};

const EMPTY: LeaveNotificationSettingsResponse = {
  notifications: EMPTY_NOTIFICATIONS,
};

export function useLeaveNotificationSettings() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const query = useQuery({
    queryKey: ["leave-notification-settings"],
    enabled: Boolean(token),
    queryFn: async (): Promise<LeaveNotificationSettingsResponse> => {
      try {
        const res = await axiosInstance.get(
          "/api/leave-settings/notifications",
        );
        const data = res.data?.data;

        // normalize shape defensively
        const notifications = data?.notifications ?? {};
        return {
          notifications: {
            notifyHr: Boolean(notifications.notifyHr),
            notifyApprover: Boolean(notifications.notifyApprover),
            notifyLineManager: Boolean(notifications.notifyLineManager),
            notifyEmployeeOnDecision: Boolean(
              notifications.notifyEmployeeOnDecision,
            ),
            notificationCcRoles: notifications.notificationCcRoles ?? [],
            notificationChannels: notifications.notificationChannels ?? [],
          },
        };
      } catch (error) {
        if (isAxiosError(error) && error.response) return EMPTY;
        return EMPTY;
      }
    },
  });

  const updateNotifications = async (value: LeaveNotificationSettingsData) => {
    await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
      key: "notifications",
      value,
    });
  };

  return {
    ...query,
    updateNotifications,
  };
}
