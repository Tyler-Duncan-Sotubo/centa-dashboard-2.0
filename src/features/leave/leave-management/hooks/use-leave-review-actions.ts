"use client";

import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function useLeaveReviewActions(id?: string) {
  const approve = useUpdateMutation({
    endpoint: `/api/leave-approval/approve/${id}`,
    successMessage: "Leave request approved successfully",
    refetchKey: "leave-data",
  });

  const reject = useUpdateMutation({
    endpoint: `/api/leave-approval/reject/${id}`,
    successMessage: "Leave request rejected successfully",
    refetchKey: "leave-data",
  });

  return { approve, reject };
}
