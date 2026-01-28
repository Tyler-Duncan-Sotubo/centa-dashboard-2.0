"use client";

import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";

import { MonthlySummaryColumns } from "./MonthlySummaryColumns";
import { DashboardAttendanceSummary } from "./DashboardAttendanceSummary";
import { useAttendanceReport } from "../hooks/use-attendance-report";
import { useReportExport } from "@/shared/hooks/use-report-export";
import { ReportYearMonthSelector } from "@/shared/ui/report-year-month-selector";
import { ReportExportButton } from "@/shared/ui/report-export-button";

export function AttendanceReportContainer() {
  const {
    status,
    year,
    month,
    setYear,
    setMonth,
    yearMonth,
    data,
    isLoading,
    isError,
    token,
    years,
    months,
  } = useAttendanceReport();

  const { exportAttendanceReport, isExporting } = useReportExport(token);

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <div>
        <p>Error</p>
      </div>
    );

  const dailySummary = data?.dailySummary ?? ({} as any);
  const monthlySummary = data?.monthlySummary ?? [];

  return (
    <div>
      <div className="p-5">
        <PageHeader
          title="Attendance Report"
          description="View and manage attendance reports for your employees."
        />
      </div>

      <div className="mt-10 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daily Attendance Summary</h2>

          <div className="flex items-center justify-between space-x-3">
            <ReportYearMonthSelector
              year={year}
              month={month}
              years={years}
              months={months}
              onYearChange={setYear}
              onMonthChange={setMonth}
            />

            <ReportExportButton
              isLoading={isExporting}
              onExport={() =>
                exportAttendanceReport(
                  "gen-daily-attendance-summary",
                  yearMonth,
                )
              }
              endpointLabel="Daily Attendance Summary"
            />
          </div>
        </div>

        <DashboardAttendanceSummary dashboard={dailySummary?.dashboard} />
      </div>

      <div className="mt-10 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Monthly Attendance Summary</h2>

          <div className="flex items-center justify-between space-x-3">
            <ReportYearMonthSelector
              year={year}
              month={month}
              years={years}
              months={months}
              onYearChange={setYear}
              onMonthChange={setMonth}
            />

            <ReportExportButton
              isLoading={isExporting}
              onExport={() =>
                exportAttendanceReport(
                  "gen-monthly-attendance-summary",
                  yearMonth,
                )
              }
              endpointLabel="Monthly Attendance Summary"
            />
          </div>
        </div>

        <DataTable
          columns={MonthlySummaryColumns as any}
          data={monthlySummary}
        />
      </div>
    </div>
  );
}
