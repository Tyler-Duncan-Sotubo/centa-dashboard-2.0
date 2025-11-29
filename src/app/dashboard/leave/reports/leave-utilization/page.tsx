"use client";

import React from "react";
import { LeaveUtilizationChart } from "./_components/LeaveUtilizationChart";
import { DepartmentUsageChart } from "./_components/DepartmentUsageChart";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const LeaveUtilizationReport = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchBalanceReport = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/leave-reports/utilization-report?groupBy=year"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { leaveBalances: [] };
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leave-utils-report"],
    queryFn: fetchBalanceReport,
    enabled: !!session?.backendTokens.accessToken,
  });

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
};

export default LeaveUtilizationReport;
