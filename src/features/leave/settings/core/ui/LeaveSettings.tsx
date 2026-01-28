import React from "react";
import LeaveApprovalSettings from "./LeaveApprovalSettings";
import LeaveEntitlementSettings from "./LeaveEntitlementSettings";
import LeaveDaysAndEligibilitySettings from "./LeaveDaysAndEligibilitySettings";
import LeaveNotificationSettings from "./LeaveNotificationSettings";

export const LeaveSettings = () => {
  return (
    <div>
      <LeaveApprovalSettings />
      <LeaveEntitlementSettings />
      <LeaveDaysAndEligibilitySettings />
      <LeaveNotificationSettings />
    </div>
  );
};
