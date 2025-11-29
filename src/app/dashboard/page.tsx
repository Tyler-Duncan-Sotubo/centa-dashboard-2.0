"use client";

import React from "react";
import CompanySummary from "../../components/widgets/CompanySummary";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { EmployeesTable } from "@/components/common/tables/employees.table";
import { formattedDate, timeOfDay } from "@/utils/formatDate";
import { PayrollOverview } from "./payroll/reports/summary/_components/PayrollOverview";
import { EmployeeDepartmentPieChart } from "@/components/widgets/RoleLevelBarChart";
import QuickActions from "@/components/widgets/QuickActions";
import { AttendanceChart } from "@/components/widgets/AttendanceChart";
import { EmployeesOnLeaveCard } from "@/components/widgets/EmployeesOnLeaveCard";
import { Employee } from "@/types/employees.type";
import { payrollOverview } from "@/types/analytics.type";
import DashboardBanner from "@/components/common/DashboardBanner";
import OnboardingChecklist from "./OnboardingChecklist";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export interface SummaryData {
  totalEmployees: number;
  newStartersCount: number;
  leaversCount: number;
  previousMonth: {
    totalEmployees: number;
    newStartersCount: number;
    leaversCount: number;
  };
  allHolidays: {
    date: string;
    name: string;
  }[];
  allEmployees: Employee[];
  companyName: string;
  allDepartments: {
    department: string;
    employees: number;
    fill: string;
    percent: string;
  }[];
  payrollSummary: payrollOverview[];
  recentLeaves: {
    name: string;
    startDate: Date;
    endDate: Date;
    leaveType: string;
  }[];
  attendanceSummary: {
    month: string;
    present: number;
    absent: number;
    late: number;
  }[];
  announcements: { id: string; title: string }[];
  onboardingTaskCompleted: boolean;
}

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const axiosAuth = useAxiosAuth();

  const adminRoles = ["admin", "super_admin", "hr_manager"];
  const nonAdmin = !adminRoles.includes(session?.user.role || "");

  const fetchCompanySummary = async () => {
    try {
      const res = await axiosAuth.get("/api/company/summary");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  async function fetchNextPayDate() {
    try {
      const res = await axiosAuth.get("/api/pay-schedules/next-pay-date");
      if (!res.data?.data || isAxiosError(res.data)) {
        throw new Error("No next pay date");
      }

      return res.data.data as string;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return "";
      }
    }
  }

  const { data, isLoading, isError } = useQuery<SummaryData>({
    queryKey: ["company-summary"],
    queryFn: fetchCompanySummary,
    enabled: !!session?.backendTokens.accessToken,
  });

  const {
    data: nextPayDate,
    isLoading: isLoadingNextPayDate,
    isError: isErrorNextPayDate,
  } = useQuery({
    queryKey: ["nextPayDate"],
    queryFn: fetchNextPayDate,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading || isLoadingNextPayDate)
    return <Loading />;
  if (isError || isErrorNextPayDate) return <p>Error loading data</p>;

  return (
    <section className="px-4">
      <section>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-medium">
              Good {timeOfDay}, {data?.companyName}!
            </p>
          </div>
          <p className="text-sm text-textSecondary mb-6">{formattedDate}</p>
        </div>
      </section>
      <div className="md:flex md:justify-between md:items-start gap-4">
        <div className="space-y-4 md:w-[70%]">
          <DashboardBanner
            nextPayDate={nextPayDate}
            announcements={data?.announcements}
          />
          <CompanySummary data={data} />
          {!nonAdmin && (
            <PayrollOverview payrollSummary={data?.payrollSummary} dashboard />
          )}
        </div>
        <div className="md:w-[35%]">
          {data?.recentLeaves && data.recentLeaves.length > 0 && (
            <EmployeesOnLeaveCard data={data?.recentLeaves} />
          )}
          {!nonAdmin && (
            <QuickActions
              nextPayDate={nextPayDate}
              totalEmployees={data?.totalEmployees}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <div className="col-span-1 sm:col-span-2">
          <AttendanceChart data={data?.attendanceSummary} />
        </div>
        <EmployeeDepartmentPieChart data={data?.allDepartments} />
      </div>
      <section className="md:flex py-5 gap-4 w-full"></section>

      {!nonAdmin && (
        <>
          <EmployeesTable data={data?.allEmployees} />
          <OnboardingChecklist
            onboardingTaskCompleted={data?.onboardingTaskCompleted}
          />
        </>
      )}
    </section>
  );
};

export default DashboardPage;
