"use client";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { useSession } from "next-auth/react";

import { approverRoles, fallbackRoles } from "../config/asset-approval-roles";
import { useAssetSettingsQuery } from "../hooks/use-asset-settings-query";
import { useAssetSettingsUpdate } from "../hooks/use-asset-settings-update";
import { useAssetSettingsForm } from "../hooks/use-asset-settings-form";

export function AssetApprovalSettingsView() {
  const { status } = useSession();
  const { data, isLoading, isError } = useAssetSettingsQuery();
  const { updateAssetSetting } = useAssetSettingsUpdate();
  const {
    enabled,
    setEnabled,
    approverChain,
    setApproverChain,
    fallbackApprovers,
    setFallbackApprovers,
  } = useAssetSettingsForm(data);

  const toggleApproval = async () => {
    const next = !enabled;
    setEnabled(next);
    await updateAssetSetting("multi_level_approval", next, () =>
      setEnabled(!next),
    );
  };

  const updateChain = async (updated: string[]) => {
    setApproverChain(updated);
    await updateAssetSetting("approver_chain", updated);
  };

  const updateFallback = async (updated: string[]) => {
    setFallbackApprovers(updated);
    await updateAssetSetting("approval_fallback", updated);
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading asset settings</p>;

  return (
    <div className="px-4">
      <PageHeader
        title="Asset Approval Settings"
        description="Configure the approval workflow for asset requests."
      />

      <Card className="md:w-2/3 mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            Asset Approval Workflow
            <Switch
              id="asset-multi-approval"
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
                {fallbackRoles.map((role) => (
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
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
