"use client";

import { useRouter } from "next/navigation";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";

export type CreateLeaveRequestPayload = {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  partialDay: "AM" | "PM" | "FULL";
  employeeId: string;
};

export function useCreateLeaveRequest(onReset?: () => void) {
  const router = useRouter();

  const createRequest = useCreateMutation({
    endpoint: "/api/leave-request",
    successMessage: "Leave request submitted",
    refetchKey: "leaves leave-balance",
    onSuccess: () => {
      onReset?.();
      router.push("/ess/leave");
    },
  });

  return createRequest;
}
