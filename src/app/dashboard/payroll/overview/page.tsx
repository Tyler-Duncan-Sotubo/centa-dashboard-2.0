"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OverviewCards } from "@/components/common/cards/dashboard.card";
import { Bars } from "@/components/common/charts/bar";
import { PayrollDashboard } from "@/types/payroll.type";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, UserPlus } from "lucide-react";
import { format, formatDate, parse, subMonths } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { YtdSummary } from "@/components/common/cards/YtdSummary";
import PageHeader from "@/components/pageHeader";
import { PiExportBold } from "react-icons/pi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaCalendarAlt } from "react-icons/fa";
import AnnouncementBanner from "@/components/common/AnnouncementBanner";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { ClientGuard } from "@/components/guard/ClientGuard";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [allRuns, setAllRuns] = useState<PayrollDashboard["runSummaries"]>([]);
  const [monthlyRuns, setMonthlyRuns] = useState<
    PayrollDashboard["runSummaries"]
  >([]);

  const fetchPayrollDashboard = async (month?: string) => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/company-payroll",
        {
          params: month ? { month } : {},
        }
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  async function fetchNextPayDate() {
    try {
      const res = await axiosInstance.get("/api/pay-schedules/next-pay-date");
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

  const {
    data: dashboard,
    isLoading,
    isError,
  } = useQuery<PayrollDashboard, Error>({
    queryKey: ["payrollDashboard"],
    queryFn: () => fetchPayrollDashboard(selectedMonth),
    enabled: !!session?.backendTokens?.accessToken,
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

  useEffect(() => {
    if (dashboard) {
      setAllRuns(dashboard.runSummaries);
      setMonthlyRuns(
        dashboard.runSummaries.filter((r) => r.payrollMonth === defaultMonth)
      );
    }
  }, [dashboard, defaultMonth]);

  // 4) When the user picks a new month, re-filter our allRuns
  useEffect(() => {
    setMonthlyRuns(allRuns.filter((r) => r.payrollMonth === selectedMonth));
  }, [selectedMonth, allRuns]);

  if (isLoading || isLoadingNextPayDate || status === "loading")
    return <Loading />;
  if (isError || isErrorNextPayDate) return <p>Error fetching data</p>;

  const recentMonths = Array.from({ length: 12 }, (_, i) =>
    format(subMonths(new Date(), i), "yyyy-MM")
  );

  const allMonths = Array.from(
    new Set([
      ...recentMonths,
      ...(dashboard?.runSummaries?.map((r) => r.payrollMonth) || []),
    ])
  ).sort((a, b) => b.localeCompare(a)); // Deduplicate and sort

  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <section className="relative px-5 mt-3">
        {/* Header with Background Image */}
        <PageHeader
          title="Payroll Overview"
          description="Get a quick overview of your payroll costs and employee headcount."
        >
          <Button>
            <PiExportBold className="mr-2" size={20} />
            Export
          </Button>
        </PageHeader>
        <AnnouncementBanner nextPayDate={nextPayDate} />
        {/* Payroll Breakdown header + dropdown */}
        <div className="flex items-center justify-between mt-4  border-t border-background pt-4 pr-4">
          <p className="text-lg font-semibold">Payroll Breakdown</p>

          <Select
            value={selectedMonth}
            onValueChange={(val) => setSelectedMonth(val)}
          >
            <SelectTrigger className="w-[200px]">
              <FaCalendarAlt className="mr-2" size={20} />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {allMonths.map((m) => {
                const label = format(
                  parse(m, "yyyy-MM", new Date()),
                  "MMMM yyyy"
                );
                return (
                  <SelectItem key={m} value={m}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <OverviewCards runSummaries={monthlyRuns} />
        <p className="px-2 text-md font-bold">Year to Date Summary</p>
        <YtdSummary yearToDate={dashboard?.yearToDate} />

        <p className="p-2 text-xl font-bold">Payroll Cost Overview</p>

        <section className="md:flex my-6 md:space-x-4">
          <div className="md:w-[35%] flex flex-col space-y-4 gap-4 md:mt-0 mt-10 mx-auto">
            {/* Pay Date */}
            <section className="space-y-4">
              <section className="flex text-sm space-x-4">
                <div className="rounded-xl shadow-xs border border-background w-full p-2">
                  <p className="text-textSecondary">Next Pay Day</p>
                  <p className="font-semibold">
                    {nextPayDate && !isNaN(new Date(nextPayDate).getTime())
                      ? formatDate(new Date(nextPayDate), "dd MMMM yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-xl shadow-xs border border-background w-full p-2">
                  <p className="text-textSecondary">Status</p>
                  <p className="font-semibold text-brand">Scheduled</p>
                </div>
              </section>

              <section className="flex text-sm space-x-4">
                <div className="rounded-xl shadow-xs border border-background w-full p-2">
                  <p className="text-textSecondary">Total Employees</p>
                  <p className="font-semibold ">{dashboard?.headcount}</p>
                </div>
                <div className="rounded-xl shadow-xs border border-background w-full p-2">
                  <p className="text-textSecondary">Tax File Date</p>
                  <p className="font-semibold ">
                    {nextPayDate && !isNaN(new Date(nextPayDate).getTime())
                      ? formatDate(
                          new Date(
                            new Date(nextPayDate).setDate(
                              new Date(nextPayDate).getDate() + 10
                            )
                          ),
                          "dd MMMM yyyy"
                        )
                      : "N/A"}
                  </p>
                </div>
              </section>
            </section>

            {/* Quick Actions */}
            <section className="">
              <div>
                <p className="text-lg mb-2 font-bold">Quick Actions</p>
              </div>
              <div className="flex flex-col space-y-6">
                <Link href="/dashboard/payroll">
                  <Button className="w-full">
                    <CalendarDays className="mr-2" size={20} /> Run Payroll
                  </Button>
                </Link>
                <Link href="/dashboard/taxes">
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2" size={20} />
                    File Tax Returns
                  </Button>
                </Link>
                <Link href="/dashboard/payroll">
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2" size={20} /> View Payslips
                  </Button>
                </Link>
                <Link href="/dashboard/employees/invite">
                  <Button className="w-full" variant="secondary">
                    <UserPlus className="mr-2" size={20} /> Add New Employee
                  </Button>
                </Link>
              </div>
            </section>
          </div>
          <div className="rounded-xl shadow-xs border border-background md:w-[65%] md:p-4">
            <Bars runSummaries={dashboard?.runSummaries} />
          </div>
        </section>
      </section>
    </ClientGuard>
  );
};

export default Dashboard;
