"use client";

import { DataTable } from "@/components/DataTable";
import React, { useMemo, useState } from "react";
import { leaveBalanceColumns } from "./_components/LeaveBalanceColumns";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/pageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, FolderIcon } from "lucide-react";
import { useDownloadFile } from "@/utils/useDownloadFile";
import { BiExport } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const LeaveReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: downloadLoading } = useDownloadFile(token);

  const fetchBalanceReport = async () => {
    try {
      const res = await axiosInstance.get("/api/leave-reports/balance-report");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { leaveBalances: [] };
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leave-balance-report"],
    queryFn: fetchBalanceReport,
    enabled: !!session?.backendTokens.accessToken,
  });

  // filters state
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all");

  // extract filter values dynamically
  const years = useMemo(() => {
    if (!data) return [];
    const uniqueYears = Array.from(
      new Set<number>(
        data.leaveBalances.map(
          (item: { year: number; leaveTypeName: string }) => item.year
        )
      )
    );
    return uniqueYears.sort((a, b) => b - a);
  }, [data]);

  const leaveTypes = useMemo(() => {
    if (!data) return [];
    const uniqueTypes = Array.from(
      new Set(
        data.leaveBalances.map(
          (item: { year: number; leaveTypeName: string }) => item.leaveTypeName
        )
      )
    );
    return uniqueTypes;
  }, [data]);

  // filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.leaveBalances.filter(
      (item: { year: number; leaveTypeName: string }) => {
        const matchYear =
          selectedYear === "all" || item.year.toString() === selectedYear;
        const matchType =
          selectedLeaveType === "all" ||
          item.leaveTypeName === selectedLeaveType;
        return matchYear && matchType;
      }
    );
  }, [data, selectedYear, selectedLeaveType]);

  function ExportButton({
    endpoint,
    label = "Export",
    filters,
  }: {
    endpoint: string;
    label?: string;
    filters: { year?: string; leaveType?: string };
  }) {
    const handleExport = async () => {
      try {
        const params = new URLSearchParams();

        if (filters.year && filters.year !== "all") {
          params.append("year", filters.year);
        }
        if (filters.leaveType && filters.leaveType !== "all") {
          params.append("leaveTypeName", filters.leaveType);
        }

        const url = `/api/leave-reports/${endpoint}?${params.toString()}`;

        await download(url);
      } finally {
      }
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

  if (status === "loading" || isLoading) return <Loading />;
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
            <SelectTrigger className="w-[200px]">
              <CalendarIcon className="w-4 h-4" />
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year: number) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leave Type Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedLeaveType}
            onValueChange={setSelectedLeaveType}
          >
            <SelectTrigger className="w-[200px]">
              <FolderIcon className="w-4 h-4" />
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              {leaveTypes.map((type) => (
                <SelectItem key={type as string} value={type as string}>
                  {type as string}
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
};

export default LeaveReportPage;
