"use client";

import { useState } from "react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const availableRoles = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Finance Officer", value: "finance_officer" },
  { label: "Payroll Specialist", value: "payroll_specialist" },
  { label: "HR Manager", value: "hr_manager" },
];

const fallbackRoles = [
  { label: "Finance Officer", value: "finance_officer" },
  { label: "Payroll Specialist", value: "payroll_specialist" },
];

export default function WorkflowApprovalSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [approverChain, setApproverChain] = useState<string[]>([]);
  const [fallbackApprovers, setFallbackApprovers] = useState<string[]>([]);

  async function fetchProrationSetting() {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-settings/approval-proration",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["workflow-approval-settings"],
    queryFn: async () => {
      const data = await fetchProrationSetting();
      setEnabled(data.multiLevelApproval);
      setApproverChain(data.approverChain);
      setFallbackApprovers(data.approvalFallback || []);
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  async function toggleApproval() {
    try {
      const newValue = !enabled;
      setEnabled(newValue);

      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "multi_level_approval", value: newValue },
      );

      toast({
        title: "Approval Workflow Updated",
        description: `Multi-level approval has been ${
          newValue ? "enabled" : "disabled"
        }.`,
        variant: "success",
      });
    } catch {
      setEnabled(!enabled); // Revert
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
    }
  }

  async function updateApproverChain(updated: string[]) {
    try {
      setApproverChain(updated);

      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "approver_chain", value: updated },
      );

      toast({
        title: "Approver Chain Updated",
        description: "Your approval steps have been saved.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update approver chain",
        variant: "destructive",
      });
    }
  }

  async function updateFallbackApprovers(updated: string[]) {
    try {
      setFallbackApprovers(updated);

      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "approval_fallback", value: updated },
      );

      toast({
        title: "Fallback Roles Updated",
        description: "Backup approvers have been saved.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update fallback roles",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center gap-2">
          Approval Workflow
          <Switch
            id="multi_level_approval"
            checked={enabled}
            onCheckedChange={toggleApproval}
          />
        </CardTitle>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          <Label className="text-lg font-medium">
            Select the roles that will approve payroll before it is processed.
            <span className="text-md text-muted-foreground block">
              (Select multiple roles to create a multi-level approval chain)
            </span>
          </Label>
          <div className="flex flex-col gap-2 ">
            {availableRoles.map((role) => (
              <div
                key={role.value}
                className="flex items-center justify-between "
              >
                <Label className="text-lg" htmlFor={`role-${role.value}`}>
                  {role.label}
                </Label>
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
          <div className="mt-8">
            <Label className="text-lg font-medium">
              Select fallback roles
              <span className="text-md text-muted-foreground block">
                (These users can approve if the primary role is unavailable)
              </span>
            </Label>
            <div className="flex flex-col gap-2 mt-2">
              {fallbackRoles.map((role) => (
                <div
                  key={`fallback-${role.value}`}
                  className="flex items-center justify-between"
                >
                  <Label className="text-lg" htmlFor={`fallback-${role.value}`}>
                    {role.label}
                  </Label>
                  <Switch
                    id={`fallback-${role.value}`}
                    checked={fallbackApprovers.includes(role.value)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...fallbackApprovers, role.value]
                        : fallbackApprovers.filter((r) => r !== role.value);
                      updateFallbackApprovers(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
