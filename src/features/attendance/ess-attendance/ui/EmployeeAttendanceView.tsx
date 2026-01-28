"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";

import { AttendanceSummary } from "../ui/AttendanceSummary";
import { attendanceSummaryColumns } from "../ui/attendanceSummaryColumns";
import { useEmployeeAttendanceMonth } from "../hooks/use-employee-attendance-month";
import { AttendanceSummaryMobileRow } from "./AttendanceSummaryMobileRow";

export function EmployeeAttendanceView() {
  const {
    currentDate,
    handlePrevMonth,
    handleNextMonth,
    monthData,
    isLoading,
  } = useEmployeeAttendanceMonth();

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Summary"
        description={`Attendance records for ${format(currentDate, "MMMM yyyy")}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft />
          </Button>
          <span className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>
      </PageHeader>

      <AttendanceSummary records={monthData} />

      <h3 className="mt-4 font-semibold text-lg">Daily Attendance Details</h3>
      <DataTable
        columns={attendanceSummaryColumns}
        data={monthData}
        mobileRow={AttendanceSummaryMobileRow}
        hideTableOnMobile
      />
    </div>
  );
}
