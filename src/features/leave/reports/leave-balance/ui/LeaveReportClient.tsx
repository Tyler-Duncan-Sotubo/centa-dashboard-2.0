"use client";

import React, { useMemo, useState } from "react";
import { CalendarIcon, FolderIcon } from "lucide-react";
import { BiExport } from "react-icons/bi";
import { useSession } from "next-auth/react";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import { useLeaveBalanceReport } from "../hooks/useLeaveBalanceReport";
import { leaveBalanceColumns } from "./LeaveBalanceColumns";

type Filters = { year?: string; leaveType?: string };

function ExportButton({
  endpoint,
  label = "Export",
  filters,
}: {
  endpoint: string;
  label?: string;
  filters: Filters;
}) {
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: downloadLoading } = useDownloadFile(token);

  const handleExport = async () => {
    const params = new URLSearchParams();

    if (filters.year && filters.year !== "all")
      params.append("year", filters.year);
    if (filters.leaveType && filters.leaveType !== "all") {
      params.append("leaveTypeName", filters.leaveType);
    }

    const url = `/api/leave-reports/${endpoint}?${params.toString()}`;
    await download(url);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      isLoading={downloadLoading}
      disabled={downloadLoading}
    >
      <BiExport />
      <span className="ml-2">{label}</span>
    </Button>
  );
}

export default function LeaveReportClient() {
  const { status: sessionStatus } = useSession();
  const { data, isLoading, isError } = useLeaveBalanceReport();

  // filters state
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all");

  const leaveBalances = data?.leaveBalances ?? [];

  // extract filter values dynamically
  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set<number>(leaveBalances.map((i) => i.year)),
    );
    return uniqueYears.sort((a, b) => b - a);
  }, [leaveBalances]);

  const leaveTypes = useMemo(() => {
    return Array.from(
      new Set<string>(leaveBalances.map((i) => i.leaveTypeName)),
    );
  }, [leaveBalances]);

  // filtered data
  const filteredData = useMemo(() => {
    return leaveBalances.filter((item) => {
      const matchYear =
        selectedYear === "all" || item.year.toString() === selectedYear;
      const matchType =
        selectedLeaveType === "all" || item.leaveTypeName === selectedLeaveType;

      return matchYear && matchType;
    });
  }, [leaveBalances, selectedYear, selectedLeaveType]);

  if (sessionStatus === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="p-5">
      <PageHeader
        title="Leave Balance Report"
        description="View the leave balances of all employees."
      />

      <div className="flex justify-end gap-4 mb-4">
        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-50">
              <CalendarIcon className="w-4 h-4" />
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leave Type Filter + Export */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedLeaveType}
            onValueChange={setSelectedLeaveType}
          >
            <SelectTrigger className="w-50">
              <FolderIcon className="w-4 h-4" />
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              {leaveTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ExportButton
            endpoint="gen-leave-balance-report"
            label="Export Report"
            filters={{ year: selectedYear, leaveType: selectedLeaveType }}
          />
        </div>
      </div>

      <DataTable columns={leaveBalanceColumns} data={filteredData} />
    </div>
  );
}
