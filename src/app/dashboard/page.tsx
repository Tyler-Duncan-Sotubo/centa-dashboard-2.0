"use client";

import CompanySummary from "../../features/home/dashboard/CompanySummary";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { EmployeesTable } from "@/features/employees/core/ui/employees.table";
import { formattedDate, timeOfDay } from "@/shared/utils/formatDate";
import { PayrollOverview } from "./payroll/reports/summary/_components/PayrollOverview";
import { EmployeeDepartmentPieChart } from "@/features/home/dashboard/RoleLevelBarChart";
import QuickActions from "@/features/home/dashboard/QuickActions";
import { AttendanceChart } from "@/features/home/dashboard/AttendanceChart";
import { EmployeesOnLeaveCard } from "@/features/home/dashboard/EmployeesOnLeaveCard";
import { Employee } from "@/types/employees.type";
import { payrollOverview } from "@/types/analytics.type";
import DashboardBanner from "@/features/home/dashboard/DashboardBanner";
import OnboardingChecklist from "./OnboardingChecklist";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const adminRoles = ["admin", "super_admin", "hr_manager"];
  const nonAdmin = !adminRoles.includes(session?.user.role || "");
  const userName = session?.user.firstName;

  const enabled = !!session?.backendTokens?.accessToken;

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useQuery<SummaryData>({
    queryKey: ["company-summary"],
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/company/summary");
        return res.data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response) return null;
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: nextPayDate,
    isLoading: isNextPayLoading,
    isError: isNextPayError,
    refetch: refetchNextPay,
  } = useQuery<string>({
    queryKey: ["nextPayDate"],
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/pay-schedules/next-pay-date");
        if (!res.data?.data || isAxiosError(res.data)) return "";
        return res.data.data as string;
      } catch (error) {
        if (isAxiosError(error) && error.response) return "";
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Only block on session loading — not on data loading
  if (status === "loading") {
    return (
      <section className="px-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4">
      {/* Header */}
      <section>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-medium">
              Good {timeOfDay}, {userName ?? "..."}!
            </p>
          </div>
          <p className="text-sm text-textSecondary mb-6">{formattedDate}</p>
        </div>
      </section>

      {/* Error banner — non-blocking */}
      {(isSummaryError || isNextPayError) && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>Some data failed to load.</span>
          <button
            className="underline text-xs"
            onClick={() => {
              if (isSummaryError) refetchSummary();
              if (isNextPayError) refetchNextPay();
              router.refresh();
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="md:flex md:justify-between md:items-start gap-4">
        <div className="space-y-4 md:w-[70%]">
          <DashboardBanner
            nextPayDate={nextPayDate}
            announcements={summary?.announcements}
          />

          {/* CompanySummary — shows skeleton internally when data is null */}
          <CompanySummary data={summary} />

          {!nonAdmin && (
            <PayrollOverview
              payrollSummary={summary?.payrollSummary}
              dashboard
            />
          )}
        </div>

        <div className="md:w-[35%]">
          {summary?.recentLeaves && summary.recentLeaves.length > 0 && (
            <EmployeesOnLeaveCard data={summary.recentLeaves} />
          )}
          {!nonAdmin && (
            <QuickActions
              nextPayDate={nextPayDate}
              totalEmployees={summary?.totalEmployees}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <div className="col-span-1 sm:col-span-2">
          <AttendanceChart data={summary?.attendanceSummary} />
        </div>
        <EmployeeDepartmentPieChart data={summary?.allDepartments} />
      </div>

      <section className="md:flex py-5 gap-4 w-full" />

      {!nonAdmin && (
        <>
          {/* ✅ Show skeleton table while loading */}
          {isSummaryLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <EmployeesTable data={summary?.allEmployees} />
          )}

          <OnboardingChecklist
            onboardingTaskCompleted={summary?.onboardingTaskCompleted}
          />
        </>
      )}
    </section>
  );
};

export default DashboardPage;
