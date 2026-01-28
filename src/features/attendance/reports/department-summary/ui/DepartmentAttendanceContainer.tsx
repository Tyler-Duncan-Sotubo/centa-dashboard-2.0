"use client";

import React, { useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DepartmentAttendanceBarChart } from "./DepartmentAttendanceChart";
import { useReportExport } from "@/shared/hooks/use-report-export";
import { ReportYearMonthSelector } from "@/shared/ui/report-year-month-selector";
import { ReportExportButton } from "@/shared/ui/report-export-button";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

const AttendanceReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const { exportAttendanceReport, isExporting } = useReportExport(token);

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;

  const fetchDailyAttendance = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/attendance-report/attendance/combined?yearMonth=${yearMonth}`,
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      throw error;
    }
  };

  const {
    data,
    isLoading: attendanceLoading,
    error,
  } = useQuery({
    queryKey: ["attendance-combined", yearMonth],
    queryFn: fetchDailyAttendance,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || attendanceLoading) return <Loading />;
  if (error)
    return (
      <div>
        <p>Error</p>
      </div>
    );

  const { departmentSummary } = data ?? {};

  return (
    <div>
      <div className="p-5">
        <PageHeader
          title="Department Attendance Summary"
          description="View department attendance summary and download reports."
        />
      </div>

      <div className="mt-10 px-5">
        <div className="flex items-center justify-end space-x-3 my-5">
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
              exportAttendanceReport("gen-department-report", yearMonth)
            }
            endpointLabel="Department Attendance Summary"
          />
        </div>

        <DepartmentAttendanceBarChart departmentSummary={departmentSummary} />
      </div>
    </div>
  );
};

export default AttendanceReportPage;
