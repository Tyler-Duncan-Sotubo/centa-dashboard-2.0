"use client";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";

export function useCreateLeaveRequest(
  onSuccess?: () => void,
  onError?: (m: string) => void,
) {
  const create = useCreateMutation({
    endpoint: "/api/leave-request",
    successMessage: "Leave request created successfully",
    refetchKey: "leave-data",
    onSuccess,
    onError,
  });

  return create;
}
