"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatars } from "@/components/avatars";
import { ReportFilters } from "../_components/ReportFilters";
import { ColumnDef } from "@tanstack/react-table";

type GoalReportRow = {
  goalId: string;
  employeeId: string;
  employeeName: string;
  jobRoleName: string;
  departmentName: string;
  title: string;
  description: string;
  type: string;
  status: string;
  weight: number;
  startDate: string;
  dueDate: string;
};

export default function GoalReportPage() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  // ---- FILTERS STATE ----
  const [filters, setFilters] = useState<{
    cycleId?: string;
    employeeId?: string;
    departmentId?: string;
    minimumScore?: number;
    status?: string;
    search?: string; // 👈 add this
  }>({});

  // ---- REPORT DATA ----
  const apiFilters = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { search, ...rest } = filters;
    return {
      ...rest,
      ...(filters.status && filters.status !== "all"
        ? { status: filters.status }
        : {}),
    };
  }, [filters]);

  const {
    data: report = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["goal-report", apiFilters],
    queryFn: async () => {
      const res = await axios.get("/api/performance-report/goal-report", {
        params: apiFilters,
      });
      return res.data.data as GoalReportRow[];
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  // ---- LOCAL SEARCH ----
  const filteredReport = React.useMemo(() => {
    if (!filters.search) return report;
    const q = filters.search.toLowerCase();
    return report.filter(
      (row: {
        employeeName: string;
        jobRoleName: string;
        departmentName: string;
      }) =>
        row.employeeName?.toLowerCase().includes(q) ||
        row.jobRoleName?.toLowerCase().includes(q) ||
        row.departmentName?.toLowerCase().includes(q)
    );
  }, [report, filters.search]);

  // ---- COLUMNS ----
  const columns: ColumnDef<GoalReportRow, unknown>[] = [
    {
      accessorKey: "employeeName",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      header: ({ column }: { column: any }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: { original: GoalReportRow } }) => (
        <div className="flex items-center space-x-2">
          {Avatars({
            name: row.original.employeeName,
          })}
          <div className="flex flex-col">
            <Link
              href={`/dashboard/performance/goals/${row.original.goalId}`}
              className="text-monzo-brandDark"
            >
              <div className="capitalize font-semibold">
                {row.original.employeeName}
              </div>
            </Link>
            <div className="capitalize font-medium text-xs text-muted-foreground">
              {row.original.jobRoleName || "No Job Role"}
            </div>
          </div>
        </div>
      ),
    },
    { accessorKey: "departmentName", header: "Department" },
    { accessorKey: "title", header: "Goal Title" },
    { accessorKey: "type", header: "Type" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge className="capitalize">{String(getValue())}</Badge>
      ),
    },
    { accessorKey: "weight", header: "Weight" },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: { original: GoalReportRow } }) =>
        row.original.description ? (
          <span title={row.original.description}>View</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      enableSorting: false,
    },
  ];

  // ---- LOADING STATE ----
  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading report data</div>;

  // ---- UI ----
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Goal Report</h1>

      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={refetch}
        appraisal={false}
        exportPath="/api/performance-report/export-goal-report"
      />

      <DataTable columns={columns} data={filteredReport} />
    </div>
  );
}
