"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Goal } from "@/types/performance/goals.type";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

interface GoalApprovalActionsProps {
  goal: Goal;
  onDone?: () => void;
  refetchKey?: string; // defaults to "goals" if not provided
}

export default function GoalApprovalActions({
  goal,
  onDone,
  refetchKey = "goals",
}: GoalApprovalActionsProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Only show for pending approval
  if (goal.status !== "pending_approval") return null;

  // Approve mutation (no body)
  const approveGoal = useUpdateMutation<void>({
    endpoint: `/api/performance-goals/${goal.id}/approve`,
    successMessage: "Goal approved",
    refetchKey,
    onSuccess: () => onDone?.(),
  });

  // Reject mutation (needs reason)
  const rejectGoal = useUpdateMutation<{ reason: string }>({
    endpoint: `/api/performance-goals/${goal.id}/reject`,
    successMessage: "Goal rejected",
    refetchKey,
    onSuccess: () => {
      setRejectReason("");
      onDone?.();
    },
  });

  const approve = async () => {
    try {
      setLoading(true);
      await approveGoal(); // no payload
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    const reason = rejectReason.trim();
    if (!reason) return;

    try {
      setLoading(true);
      await rejectGoal({ reason });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Approve */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="default" disabled={loading}>
            <FaCheck className="mr-1" /> Approve
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate the goal and notify the employee.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={approve} disabled={loading}>
              Approve goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={loading}>
            <FaTimes className="mr-1" /> Reject
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason. The employee will be asked to revise the
              goal.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={loading}
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={reject}
              disabled={loading || !rejectReason.trim()}
            >
              Reject goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
