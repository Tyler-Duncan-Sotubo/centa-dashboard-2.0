"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/ui/card";
import Loading from "@/shared/ui/loading";
import { Input } from "@/shared/ui/input";
import { useleaveapprovalsettings } from "../hooks/use-leave-approval-settings";

const availableRoles = [
  { label: "Manager", value: "manager" },
  { label: "HR", value: "hr_manager" },
  { label: "Super Admin", value: "super_admin" },
];

export default function LeaveApprovalSettings() {
  const { toast } = useToast();
  const { data, isLoading, isError, updateSetting } =
    useleaveapprovalsettings();

  const [enabled, setEnabled] = useState(false);
  const [approverChain, setApproverChain] = useState<string[]>([]);
  const [autoApproveAfterDays, setAutoApproveAfterDays] = useState(0);

  /** sync server → local state */
  useEffect(() => {
    if (!data) return;
    setEnabled(data.multiLevelApproval);
    setApproverChain(data.approverChain);
    setAutoApproveAfterDays(data.autoApproveAfterDays);
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading leave settings</p>;

  async function toggleApproval() {
    const next = !enabled;
    setEnabled(next);

    try {
      await updateSetting("multi_level_approval", next);
      toast({
        title: "Leave Approval Updated",
        description: `Multi-level leave approval ${
          next ? "enabled" : "disabled"
        }.`,
        variant: "success",
      });
    } catch {
      setEnabled(!next);
      toast({
        title: "Failed to update approval setting",
        variant: "destructive",
      });
    }
  }

  async function updateChain(updated: string[]) {
    setApproverChain(updated);

    try {
      await updateSetting("approver_chain", updated);
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

  async function updateAutoApprove(value: number) {
    setAutoApproveAfterDays(value);

    try {
      await updateSetting("auto_approve_after_days", value);
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
          <Switch checked={enabled} onCheckedChange={toggleApproval} />
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
                  <Label>{role.label}</Label>
                  <Switch
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
          </>
        )}

        <div className="space-y-1">
          <Label>Auto-Approve After Days</Label>
          <Input
            type="number"
            min={0}
            value={autoApproveAfterDays}
            onChange={(e) => updateAutoApprove(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
