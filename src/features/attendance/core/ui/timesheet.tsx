"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { GiNotebook } from "react-icons/gi";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/lib/utils";
import type { DailyDashboardAttendance } from "../types/attendance-summary.type";
import { useTimesheetDate } from "../hooks/use-timesheet-date";
import { useAttendanceSummaryQuery } from "../hooks/use-attendance-summary-query";
import AttendanceDashboard from "./attendance-dashboard";
import { attendanceColumns } from "./attendance-columns";
import { DataTable } from "@/shared/ui/data-table";

export function Timesheet({
  data,
}: {
  data: DailyDashboardAttendance | undefined;
}) {
  const { data: session } = useSession();
  const { date, setDate, open, setOpen } = useTimesheetDate();

  const { details, metrics, summaryList } = data ?? {};

  const hasToken = !!session?.backendTokens?.accessToken;
  const { data: attendanceSummary } = useAttendanceSummaryQuery(date, hasToken);

  return (
    <section>
      <section>
        <AttendanceDashboard details={details} metrics={metrics} />
      </section>

      <section>
        <DataTable
          columns={attendanceColumns}
          data={
            (attendanceSummary?.length ? attendanceSummary : summaryList) ?? []
          }
          filterKey="name"
          filterPlaceholder="Search by employee"
          toolbarLeft={
            <div className="flex items-center gap-2">
              <GiNotebook />
              <h3 className="md:text-xl text-xs font-semibold my-3">
                Daily Attendance Summary
              </h3>
            </div>
          }
          toolbarRight={
            <div className="flex items-center justify-between">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-70 justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Today</span>}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setOpen(false);
                    }}
                    disabled={(d) => d > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          }
        />
      </section>
    </section>
  );
}
