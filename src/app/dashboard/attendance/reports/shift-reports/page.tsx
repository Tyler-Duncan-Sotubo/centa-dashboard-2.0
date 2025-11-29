"use client";

import { useSession } from "next-auth/react";
import { ShiftBreakdownTable } from "./_components/ShiftBreakdownTable";
import { ShiftSummaryCards } from "./_components/ShiftSummaryCards";
import { isAxiosError } from "@/lib/axios";
import { useDownloadFile } from "@/utils/useDownloadFile";
import { useState } from "react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse } from "date-fns";
import { ShiftDashboardData } from "@/types/shift.type";
import { Button } from "@/components/ui/button";
import { BiExport } from "react-icons/bi";
import { FaCog } from "react-icons/fa";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { ConfigureReportModal } from "@/components/configure-reports-modal";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export default function ShiftDashboardPage() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading } = useDownloadFile(token);
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [reportFilters, setReportFilters] = useState<{
    yearMonth: string;
    locationId?: string;
    departmentId?: string;
  }>({
    yearMonth: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
  });

  const fetchDailyAttendance = async () => {
    try {
      const params = new URLSearchParams();
      params.set("yearMonth", reportFilters.yearMonth);

      if (reportFilters.locationId) {
        params.set("locationId", reportFilters.locationId);
      }

      if (reportFilters.departmentId) {
        params.set("departmentId", reportFilters.departmentId);
      }

      const res = await axiosInstance.get(
        `/api/attendance-report/shift-summary?${params.toString()}`
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
    queryKey: ["attendance-combined", yearMonth, reportFilters],
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

  const { monthlySummary, detailedBreakdown } = data as ShiftDashboardData;

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

  function ExportButton({
    endpoint,
    yearMonth,
    label = "Export",
  }: {
    endpoint: string;
    yearMonth: string;
    label?: string;
  }) {
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

  let formatted = "";
  if (data?.yearMonth) {
    formatted = format(
      parse(data.yearMonth, "yyyy-MM", new Date()),
      "MMMM yyyy"
    );
  }

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
          <YearSelector />
          <ExportButton
            endpoint="gen-daily-attendance-summary"
            yearMonth={yearMonth}
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
