import React from "react";
import LeaveApprovalSettings from "./LeaveApprovalSettings";
import LeaveEntitlementSettings from "./LeaveEntitlementSettings";
import LeaveDaysAndEligibilitySettings from "./LeaveDaysAndEligibilitySettings";
import LeaveNotificationSettings from "./LeaveNotificationSettings";
import PageHeader from "@/shared/ui/page-header";

export const LeaveSettingsClient = () => {
  return (
    <div className="p-5 my-10">
      <PageHeader
        title="Leave Settings"
        description="Configure leave policies, approval workflows, and notifications."
      />
      <LeaveApprovalSettings />
      <LeaveEntitlementSettings />
      <LeaveDaysAndEligibilitySettings />
      <LeaveNotificationSettings />
    </div>
  );
};
