"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

interface OptOutDialogProps {
  benefitPlanId: string;
  employeeId: string;
  planName: string;
}

export default function OptOutDialog({
  benefitPlanId,
  employeeId,
  planName,
}: OptOutDialogProps) {
  const [loading, setLoading] = useState(false);

  const optOutMutation = useUpdateMutation({
    endpoint: `/api/benefit-plan/enrollments/${employeeId}`,
    successMessage: "Successfully opted out",
    refetchKey: "benefit-enrollments",
  });

  const handleOptOut = async () => {
    setLoading(true);
    try {
      await optOutMutation({
        benefitPlanId,
      });
    } catch (error) {
      console.error("Opt-out failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-1/5 h-8 text-xs">
          Opt Out
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opt Out of Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to opt out of <strong>{planName}</strong>?
            This action cannot be undone.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Note: You must opt out at least{" "}
              <strong>one week before the end of the month</strong> for it to
              take effect in the upcoming payroll cycle.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOptOut}
            disabled={loading}
            className="bg-destructive text-white"
          >
            {loading ? "Processing..." : "Confirm Opt-Out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
