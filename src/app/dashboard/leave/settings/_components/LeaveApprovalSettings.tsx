"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const availableRoles = [
  { label: "Manager", value: "manager" },
  { label: "HR", value: "hr_manager" },
  { label: "Super Admin", value: "super_admin" },
];

export default function LeaveApprovalSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [approverChain, setApproverChain] = useState<string[]>([]);
  const [autoApproveAfterDays, setAutoApproveAfterDays] = useState(0);

  async function fetchLeaveApprovalSettings() {
    try {
      const res = await axiosInstance.get("/api/leave-settings/approval");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {};
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["leave-approval-settings"],
    queryFn: async () => {
      const data = await fetchLeaveApprovalSettings();
      setEnabled(data.multiLevelApproval ?? false);
      setApproverChain(data.approverChain ?? []);
      setAutoApproveAfterDays(data.autoApproveAfterDays ?? 0);
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading leave settings</p>;

  async function toggleApproval() {
    try {
      const newValue = !enabled;
      setEnabled(newValue);

      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key: "multi_level_approval",
        value: newValue,
      });

      toast({
        title: "Leave Approval Updated",
        description: `Multi-level leave approval ${
          newValue ? "enabled" : "disabled"
        }.`,
        variant: "success",
      });
    } catch {
      setEnabled(!enabled); // Revert
      toast({
        title: "Failed to update approval setting",
        variant: "destructive",
      });
    }
  }

  async function updateApproverChain(updated: string[]) {
    try {
      setApproverChain(updated);
      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key: "approver_chain",
        value: updated,
      });

      toast({
        title: "Approver Chain Updated",
        description: "Leave approval chain saved.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update approver chain",
        variant: "destructive",
      });
    }
  }

  async function updateAutoApproveDays(value: number) {
    try {
      setAutoApproveAfterDays(value);

      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key: "auto_approve_after_days",
        value,
      });

      toast({
        title: "Auto-Approval Days Updated",
        description: `Leave requests will be auto-approved after ${value} day(s).`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update auto-approval days",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center gap-2">
          Leave Approval Workflow
          <Switch
            id="leave_multi_level_approval"
            checked={enabled}
            onCheckedChange={toggleApproval}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {enabled && (
          <>
            <Label className="text-lg font-medium">
              Approver Roles
              <span className="text-muted-foreground block text-sm">
                Select the sequence of roles required for leave approval.
              </span>
            </Label>

            <div className="flex flex-col gap-2">
              {availableRoles.map((role) => (
                <div
                  key={role.value}
                  className="flex justify-between items-center"
                >
                  <Label htmlFor={`role-${role.value}`}>{role.label}</Label>
                  <Switch
                    id={`role-${role.value}`}
                    checked={approverChain.includes(role.value)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...approverChain, role.value]
                        : approverChain.filter((r) => r !== role.value);
                      updateApproverChain(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label htmlFor="auto-approve-days">Auto-Approve After Days</Label>
          <Input
            id="auto-approve-days"
            type="number"
            min={0}
            value={autoApproveAfterDays}
            onChange={(e) => updateAutoApproveDays(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
