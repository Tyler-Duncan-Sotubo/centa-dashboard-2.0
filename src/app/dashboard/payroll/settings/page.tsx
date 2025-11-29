"use client";

import React from "react";
import PageHeader from "@/components/pageHeader";
import { RemittanceSettings } from "./_components/statutory-deductions/RemittanceSettings";
import AllowanceSettings from "./_components/allowances/AllowanceSettings";
import WorkflowApprovalSettings from "./_components/workflow/WorkflowApprovalSettings";
import ProrationSettings from "./_components/proration/ProrationSettings";
import ThirteenthMonthSettings from "./_components/thirtenthMonth/ThirteenthMonthSettings";
import { ClientGuard } from "@/components/guard/ClientGuard";

const page = () => {
  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <div className="mb-10 px-4">
        <PageHeader
          title="Payroll Configuration"
          description="Manage your payroll settings here."
        />
        <RemittanceSettings />
        <AllowanceSettings />
        <WorkflowApprovalSettings />
        <ProrationSettings />
        <ThirteenthMonthSettings />
      </div>
    </ClientGuard>
  );
};

export default page;
