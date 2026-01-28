/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/shared/hooks/use-toast";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

interface ApprovalStep {
  id: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  fallbackRoles?: string[];
}

export function AssetApprovalSheet({
  assetRequestId,
}: {
  assetRequestId: string;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const axiosInstance = useAxiosAuth();
  const [action, setAction] = useState<"approved" | "rejected">("approved");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentUserRole = session?.user?.role;

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/asset-requests/${assetRequestId}/approval-status`,
      );
      setSteps(res.data?.data?.steps || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load approval steps",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps.find((s) => s.status === "pending");

  const updateAssetRequest = useUpdateMutation({
    endpoint: `/api/asset-requests/${assetRequestId}/approve`,
    successMessage: `Asset request ${
      action === "approved" ? "approved" : "rejected"
    }`,
    refetchKey: "asset-requests",
    onSuccess: () => {
      setSubmitting(false);
      setOpen(false);
      fetchSteps();
    },
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    await updateAssetRequest({
      action,
      remarks,
    });
  };

  useEffect(() => {
    if (open && session?.backendTokens?.accessToken) {
      fetchSteps();
    }
  }, [open, session]);

  const isFallbackActor =
    currentUserRole !== currentStep?.role &&
    !!currentUserRole &&
    currentStep?.fallbackRoles?.includes(currentUserRole);

  const isActor =
    currentUserRole === currentStep?.role ||
    (!!currentUserRole &&
      currentStep?.fallbackRoles?.includes(currentUserRole));

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      title="Asset Request Approval"
      description="Review and take action on this asset request"
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
      {loading ? (
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
