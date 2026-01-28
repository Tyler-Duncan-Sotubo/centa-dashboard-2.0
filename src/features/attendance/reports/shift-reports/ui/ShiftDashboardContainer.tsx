"use client";

import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { FaCog } from "react-icons/fa";
import { format, parse } from "date-fns";
import { ShiftDashboardData } from "@/types/shift.type";
import { ConfigureReportModal } from "@/features/attendance/reports/shift-reports/ui/configure-reports-modal";
import { ShiftSummaryCards } from "@/features/attendance/reports/shift-reports/ui/ShiftSummaryCards";
import { ShiftBreakdownTable } from "@/features/attendance/reports/shift-reports/ui/ShiftBreakdownTable";
import { useShiftDashboardMonth } from "../hooks/use-shift-dashboard-month";
import { useReportExport } from "@/shared/hooks/use-report-export";
import { ReportYearMonthSelector } from "@/shared/ui/report-year-month-selector";
import { ReportExportButton } from "@/shared/ui/report-export-button";

export function ShiftDashboardContainer() {
  const {
    status,
    token,

    years,
    months,

    year,
    month,
    setYear,
    setMonth,
    yearMonth,

    settingsOpen,
    setSettingsOpen,

    reportFilters,
    setReportFilters,

    data,
    isLoading,
    isError,
  } = useShiftDashboardMonth();

  const { exportAttendanceReport, isExporting } = useReportExport(token);

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <div>
        <p>Error</p>
      </div>
    );

  const { monthlySummary, detailedBreakdown } = data as ShiftDashboardData;

  const formatted = data?.yearMonth
    ? format(parse(data.yearMonth, "yyyy-MM", new Date()), "MMMM yyyy")
    : "";

  return (
    <div className="p-5">
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setSettingsOpen(true)}
          variant="link"
          className="text-md p-0"
        >
          <FaCog /> Configure Report
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Shift Summary{formatted ? ` – ${formatted}` : ""}
        <div className="flex justify-end gap-2">
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
              exportAttendanceReport("gen-daily-attendance-summary", yearMonth)
            }
            endpointLabel="Shift Summary"
          />
        </div>
      </h1>

      <ShiftSummaryCards summary={monthlySummary} />
      <ShiftBreakdownTable data={detailedBreakdown} />

      <ConfigureReportModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        filters={reportFilters}
        setFilters={setReportFilters}
        years={years}
        months={months}
      />
    </div>
  );
}
