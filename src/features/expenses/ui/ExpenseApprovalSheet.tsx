/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/shared/ui/select";
import GenericSheet from "@/shared/ui/generic-sheet";
import { MdUpdate } from "react-icons/md";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { useExpenseApprovalSteps } from "../hooks/use-expense-approval-steps";
import { useExpenseApprovalAction } from "../hooks/use-expense-approval-action";

export function ExpenseApprovalSheet({ expenseId }: { expenseId: string }) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"approved" | "rejected">("approved");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stepsQuery = useExpenseApprovalSteps(
    expenseId,
    open && Boolean(session?.backendTokens?.accessToken),
  );

  const steps = stepsQuery.data ?? [];
  const currentStep = useMemo(
    () => steps.find((s) => s.status === "pending"),
    [steps],
  );

  const currentUserRole = session?.user?.role;

  const isFallbackActor =
    currentUserRole !== currentStep?.role &&
    !!currentUserRole &&
    !!currentStep?.fallbackRoles?.includes(currentUserRole);

  const isActor =
    currentUserRole === currentStep?.role ||
    (!!currentUserRole &&
      !!currentStep?.fallbackRoles?.includes(currentUserRole));

  const updateExpense = useExpenseApprovalAction(expenseId, action);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await updateExpense({ action, remarks });
      setOpen(false);
      stepsQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit approval action",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      title="Expense Approval"
      description="Review and take action on this expense"
      trigger={
        <div className="flex flex-col items-center">
          <Button
            variant="link"
            className="capitalize px-0 text-xs"
            onClick={() => setOpen(true)}
          >
            <MdUpdate className="mr-1" /> Approve
          </Button>
        </div>
      }
      footer={
        isActor ? (
          <div className="mt-10">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        ) : null
      }
    >
      {stepsQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6 mt-6">
          <div>
            <Label>
              Action <span className="text-red-500">*</span>
            </Label>
            <Select
              value={action}
              onValueChange={(val) => setAction(val as "approved" | "rejected")}
              disabled={!isActor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Optional: provide comments or reason"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={!isActor}
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-2 pt-4">
            <Label className="text-sm font-medium">Approval Trail</Label>
            <ScrollArea className="h-32 pr-2">
              <ul className="space-y-2 text-sm">
                {steps.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span className="capitalize">
                      {s.role.replace("_", " ")}
                    </span>
                    <Badge variant={s.status}>{s.status.toUpperCase()}</Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {isFallbackActor && (
            <p className="text-sm text-muted-foreground italic">
              Approving as fallback role (
              {currentUserRole === "super_admin" ? "CEO" : currentUserRole}).
            </p>
          )}

          {!isActor && (
            <p className="text-muted-foreground text-sm">
              Awaiting approval by{" "}
              <span className="font-medium capitalize">
                {currentStep?.role.replace("_", " ")}
              </span>
              .
            </p>
          )}
        </div>
      )}
    </GenericSheet>
  );
}
