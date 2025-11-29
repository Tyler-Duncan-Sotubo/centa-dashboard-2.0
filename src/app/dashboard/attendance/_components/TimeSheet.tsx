"use client";

import { isAxiosError } from "@/lib/axios";
import React from "react";
import { useSession } from "next-auth/react";
import { DailyAttendanceTable } from "./DailyAttendanceTable";
import {
  AttendanceDetails,
  AttendanceMetrics,
  AttendanceSummaryItem,
} from "@/types/attendance.type";
import { GiNotebook } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import AttendanceDashboard from "./AttendanceDashboard";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import useAxiosAuth from "@/hooks/useAxiosAuth";

interface DailyAttendance {
  data:
    | {
        details: AttendanceDetails;
        metrics: AttendanceMetrics;
        summaryList: AttendanceSummaryItem[] | undefined;
      }
    | undefined;
}

export const Timesheet = ({ data }: DailyAttendance) => {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [date, setDate] = React.useState<Date>();
  const [attendanceSummary, setAttendanceSummary] = React.useState<
    AttendanceSummaryItem[] | undefined
  >(undefined);
  const [open, setOpen] = React.useState(false);

  const fetchAttendanceSummary = async (date: string) => {
    try {
      const res = await axiosAuth.get(
        `/api/clock-in-out/attendance-summary?date=${date}`
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { details, metrics, summaryList } = data ?? {};

  return (
    <section>
      <section>
        <AttendanceDashboard details={details} metrics={metrics} />
      </section>
      <section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GiNotebook />
            <h3 className="md:text-xl text-xs font-semibold my-3">
              Daily Attendance Summary
            </h3>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
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
                onSelect={async (selectedDate) => {
                  setDate(selectedDate);
                  setOpen(false);
                  if (selectedDate && session?.backendTokens?.accessToken) {
                    const formattedDate = format(selectedDate, "yyyy-MM-dd");
                    const res = await fetchAttendanceSummary(formattedDate);
                    if (res?.summaryList) {
                      setAttendanceSummary(res.summaryList);
                    }
                  }
                }}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <DailyAttendanceTable data={attendanceSummary ?? summaryList} />
      </section>
    </section>
  );
};
