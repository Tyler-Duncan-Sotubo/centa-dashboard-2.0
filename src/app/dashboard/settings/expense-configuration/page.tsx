"use client";

import { useState } from "react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useSession } from "next-auth/react";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const approverRoles = [
  { label: "Line Manager", value: "manager" },
  { label: "Finance Manager", value: "finance_manager" },
];

const fallbackRoles = [
  { label: "CEO", value: "super_admin" },
  { label: "HR Manager", value: "hr_manager" },
];

export default function ExpenseApprovalSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [approverChain, setApproverChain] = useState<string[]>([]);
  const [fallbackApprovers, setFallbackApprovers] = useState<string[]>([]);

  const fetchSettings = async () => {
    const res = await axiosInstance.get("/api/expense-settings");
    return res.data.data;
  };

  const { isLoading, isError } = useQuery({
    queryKey: ["expense-approval-settings"],
    queryFn: async () => {
      const data = await fetchSettings();
      setEnabled(data.multiLevelApproval);
      setApproverChain(data.approverChain);
      setFallbackApprovers(data.fallbackRoles || []);
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const updateSetting = async (
    key: string,
    value: boolean | string[],
    revert?: () => void,
  ) => {
    try {
      await axiosInstance.patch(
        "/api/expense-settings/update-expense-setting",
        { key, value },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );
      toast({
        title: "Setting updated successfully",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
      if (revert) revert();
    }
  };

  const toggleApproval = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    await updateSetting("multi_level_approval", newValue, () =>
      setEnabled(!newValue),
    );
  };

  const updateChain = async (updated: string[]) => {
    setApproverChain(updated);
    await updateSetting("approver_chain", updated);
  };

  const updateFallback = async (updated: string[]) => {
    setFallbackApprovers(updated);
    await updateSetting("approval_fallback", updated);
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading expense settings</p>;

  return (
    <div>
      <PageHeader
        title="Expense Approval Settings"
        description="Configure the approval workflow for expense requests."
      />
      <Card className="md:w-2/3 mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            Expense Approval Workflow
            <Switch
              id="expense-multi-approval"
              checked={enabled}
              onCheckedChange={toggleApproval}
            />
          </CardTitle>
        </CardHeader>

        {enabled && (
          <CardContent className="space-y-6">
            <div>
              <Label className="text-lg font-medium">
                Approval Chain
                <span className="text-sm text-muted-foreground block">
                  Select approval roles in order
                </span>
              </Label>
              <div className="flex flex-col gap-3 mt-3">
                {approverRoles.map((role) => (
                  <div
                    key={role.value}
                    className="flex items-center justify-between"
                  >
                    <Label htmlFor={`role-${role.value}`}>{role.label}</Label>
                    <Switch
                      id={`role-${role.value}`}
                      checked={approverChain.includes(role.value)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...approverChain, role.value]
                          : approverChain.filter((r) => r !== role.value);
                        updateChain(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-lg font-medium">
                Fallback Approvers
                <span className="text-sm text-muted-foreground block">
                  These roles can approve when primary roles are unavailable
                </span>
              </Label>
              <div className="flex flex-col gap-3 mt-3">
                {fallbackRoles.map((role) => {
                  return (
                    <div
                      key={`fallback-${role.value}`}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={`fallback-${role.value}`}>
                        {role.label}
                      </Label>
                      <Switch
                        id={`fallback-${role.value}`}
                        checked={fallbackApprovers.includes(role.value)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...fallbackApprovers, role.value]
                            : fallbackApprovers.filter((r) => r !== role.value);
                          updateFallback(updated);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
