"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Send,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Circle,
} from "lucide-react";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

interface ApprovalStep {
  id: string;
  sequence: number;
  role: string;
  status: "pending" | "approved" | "rejected";
}

interface ApprovalStatusResponse {
  approvalStatus: string;
  approvalSteps: ApprovalStep[];
}

interface SendApprovalProps {
  payrollRunId: string;
  data?: ApprovalStatusResponse;
}

export function SendPayrollForApproval({
  payrollRunId,
  data,
}: SendApprovalProps) {
  const storageKey = `payrollSent:${payrollRunId}`;
  const [sent, setSent] = useState(false);
  const steps = data?.approvalSteps || [];

  const sendForApproval = useUpdateMutation({
    endpoint: `/api/payroll/${payrollRunId}/send-for-approval`,
    successMessage: "Payroll sent for approval",
    refetchKey: "payroll payslip",
    onSuccess: () => {
      setSent(true);
      window.localStorage.setItem(storageKey, "true");
    },
  });

  useEffect(() => {
    const local = window.localStorage.getItem(storageKey);
    setSent(local === "true");
  }, [storageKey]);

  // Auto-approve if there's only one step and it's pending
  const isSingleStepFlow =
    steps.length === 1 && steps[0].status === "approved" && !sent;

  const currentStepIndex = steps.findIndex((s) => s.status === "pending");
  const currentRole =
    currentStepIndex >= 0 ? steps[currentStepIndex].role : "completed";
  const nextRole = steps[currentStepIndex + 1]?.role ?? "—";

  const handleClick = () => {
    if (!sent) {
      sendForApproval({ status: "submitted" });
    }
  };

  return (
    <>
      <Card className="max-w-lg mx-auto bg-yellow-50 border-yellow-200 mt-10">
        <CardHeader>
          <CardTitle className="text-md">
            {sent
              ? "Payroll Sent for Approval"
              : isSingleStepFlow
              ? "Auto-Approved"
              : "Send Payroll for Approval"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {sent ? (
            <p className="text-md text-gray-700">
              This payroll has already been sent for approval.
            </p>
          ) : steps.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center text-gray-800">
                <span className="font-medium">Current:</span>
                <span className="ml-2 flex items-center capitalize">
                  {currentRole.replace(/_/g, " ")}
                  <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
                  {nextRole.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-gray-700 text-md capitalize">
                {isSingleStepFlow
                  ? "No Approval Workflow. This payroll will be auto-approved."
                  : `This payroll requires approval from ${steps.length} ${
                      steps.length > 1 ? "roles" : "role"
                    }.`}
              </p>
            </div>
          ) : (
            <p className="text-gray-700">No approval flow configured.</p>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={handleClick} disabled={sent || isSingleStepFlow}>
            {sent || isSingleStepFlow ? (
              <>
                <Check className="mr-2 h-4 w-4" />{" "}
                {isSingleStepFlow ? "Auto Approved" : "Sent"}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send for Approval
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {steps.length > 0 && (
        <>
          <div className="max-w-lg mx-auto mt-10 text-center">
            {isSingleStepFlow ? (
              <p>
                Your payroll has been auto-approved. The following roles were
                involved:
              </p>
            ) : (
              <p>
                Your payroll is currently in the approval process. The following
                roles are involved:
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 justify-center mt-6">
            {steps.map((step, idx) => {
              const isDone = step.status === "approved";
              const isCurrent = step.status === "pending";

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    {isDone ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle
                        className={`h-6 w-6 ${
                          isCurrent ? "text-blue-600" : "text-gray-300"
                        }`}
                      />
                    )}
                    <span
                      className={`mt-1 text-sm font-medium uppercase ${
                        isCurrent
                          ? "text-blue-600"
                          : isDone
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
