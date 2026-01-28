"use client";

import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function useShiftMutation(args: {
  id?: string;
  onClose: () => void;
  onError: (m: string) => void;
}) {
  const { id, onClose, onError } = args;

  const createShift = useCreateMutation({
    endpoint: "/api/shifts",
    successMessage: "Shift saved",
    refetchKey: "shifts",
    onSuccess: onClose,
    onError,
  });

  const updateShift = useUpdateMutation({
    endpoint: `/api/shifts/${id}`,
    successMessage: "Shift updated",
    refetchKey: "shifts",
    onSuccess: onClose,
    onError,
  });

  return { createShift, updateShift };
}
