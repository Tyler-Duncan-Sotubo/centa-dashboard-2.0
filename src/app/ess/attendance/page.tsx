"use client";

import { useState } from "react";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { AttendanceSummary } from "./_components/AttendanceSummary";
import { attendanceSummaryColumns } from "./_components/attendanceSummaryColumns";
import { DataTable } from "@/components/DataTable";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function EmployeeAttendancePage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    if (isSameMonth(new Date(), next) || next < new Date()) {
      setCurrentDate(next);
    }
  };

  const fetchAttendance = async () => {
    const month = format(currentDate, "yyyy-MM");
    const res = await axiosInstance.get(
      `/api/clock-in-out/employee-attendance-month?employeeId=${session?.user.id}&yearMonth=${month}`
    );
    return res.data.data.summaryList;
  };

  const { data: monthData = [], isLoading } = useQuery({
    queryKey: ["attendance", currentDate, session?.user.id],
    queryFn: fetchAttendance,
    enabled: !!session?.user.id,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 ">
      <PageHeader
        title="Attendance Summary"
        description={`Attendance records for ${format(
          currentDate,
          "MMMM yyyy"
        )}`}
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
      <DataTable columns={attendanceSummaryColumns} data={monthData} />
    </div>
  );
}
