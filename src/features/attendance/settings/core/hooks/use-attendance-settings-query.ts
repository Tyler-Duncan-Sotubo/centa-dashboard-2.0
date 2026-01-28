"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { AttendanceSettings } from "../types/attendance-settings.type";

export function useAttendanceSettingsQuery(
  onHydrate: (s: AttendanceSettings) => void,
) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<AttendanceSettings>({
    queryKey: ["attendance-settings-options"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/attendance-settings/options");
        const settings = res.data.data as AttendanceSettings;
        onHydrate(settings);
        return settings;
      } catch (error) {
        if (isAxiosError(error)) return {} as AttendanceSettings;
        throw error;
      }
    },
  });
}
