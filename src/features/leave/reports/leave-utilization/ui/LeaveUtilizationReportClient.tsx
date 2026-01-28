"use client";

import React from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { useLeaveUtilizationReport } from "../hooks/useLeaveUtilizationReport";
import { LeaveUtilizationChart } from "./LeaveUtilizationChart";
import { DepartmentUsageChart } from "./DepartmentUsageChart";

export default function LeaveUtilizationReportClient() {
  const { status } = useSession();
  const { data, isLoading, isError } = useLeaveUtilizationReport("year");

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="space-y-10 p-5">
      <PageHeader
        title="Leave Utilization Report"
        description="View the leave utilization report for employees."
      />

      <LeaveUtilizationChart data={data.leaveUtilization} />
      <DepartmentUsageChart data={data.departmentUsage} />
    </div>
  );
}
