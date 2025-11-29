import React from "react";
import LeaveApprovalSettings from "./_components/LeaveApprovalSettings";
import LeaveEntitlementSettings from "./_components/LeaveEntitlementSettings";
import LeaveDaysAndEligibilitySettings from "./_components/LeaveDaysAndEligibilitySettings";
import LeaveNotificationSettings from "./_components/LeaveNotificationSettings";
import PageHeader from "@/components/pageHeader";

const LeaveSettings = () => {
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

export default LeaveSettings;
