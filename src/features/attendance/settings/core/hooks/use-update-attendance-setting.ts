"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";

export function useUpdateAttendanceSetting() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const { toast } = useToast();

  const updateAttendanceSetting = async (
    key: string,
    value: string | number | boolean,
  ) => {
    try {
      await axiosAuth.patch(
        "/api/attendance-settings/update",
        { key, value },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast({
        title: "Setting Updated",
        description: key.replace("attendance.", "").replaceAll("_", " "),
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  return { updateAttendanceSetting };
}
