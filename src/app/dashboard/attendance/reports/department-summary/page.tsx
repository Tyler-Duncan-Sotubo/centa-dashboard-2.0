"use client";

import React, { useState } from "react";
import PageHeader from "@/components/pageHeader";
import { BiExport } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { useDownloadFile } from "@/utils/useDownloadFile";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { DepartmentAttendanceBarChart } from "./_components/DepartmentAttendanceChart";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

interface ExportButtonProps {
  endpoint: string;
  yearMonth: string;
  label?: string;
}

const AttendanceReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading } = useDownloadFile(token);
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;

  const fetchDailyAttendance = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/attendance-report/attendance/combined?yearMonth=${yearMonth}`
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data,
    isLoading: AttendanceLoading,
    error,
  } = useQuery({
    queryKey: ["attendance-combined", yearMonth],
    queryFn: fetchDailyAttendance,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || AttendanceLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  const { departmentSummary } = data ?? {};

  function ExportButton({
    endpoint,
    yearMonth,
    label = "Export",
  }: ExportButtonProps) {
    const handleExport = async () => {
      try {
        await download(
          `/api/attendance-report/${endpoint}?yearMonth=${yearMonth}`
        );
      } finally {
      }
    };

    return (
      <Button
        variant="secondary"
        onClick={handleExport}
        isLoading={isLoading}
        disabled={isLoading}
      >
        <BiExport />
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  const YearSelector = () => {
    return (
      <div className="flex gap-2">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {format(new Date(`${year}-${m}-01`), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

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
          {YearSelector()}
          <ExportButton
            endpoint="gen-department-report"
            yearMonth={yearMonth}
          />
        </div>

        <DepartmentAttendanceBarChart departmentSummary={departmentSummary} />
      </div>
    </div>
  );
};

export default AttendanceReportPage;
