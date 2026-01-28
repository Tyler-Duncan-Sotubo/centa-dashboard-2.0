"use client";

import React, { useState } from "react";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import { DataTable } from "@/shared/ui/data-table";
import { ReportFilters } from "../_components/ReportFilters";
import RenderHtml from "@/shared/ui/render-html";
import Link from "next/link";
import { Avatars } from "@/shared/ui/avatars";
import { ChevronsUpDown } from "lucide-react";

// -------------- TYPE DEFS -------------- //
type AppraisalReportRow = {
  appraisalId: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  jobRoleName: string;
  departmentName: string;
  appraisalNote: string | null;
  appraisalScore: number | null;
  promotionRecommendation: string | null;
  submittedAt: string;
};

// -------------- NOTE VIEW DIALOG -------------- //
function ViewNoteButton({ note }: { note: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <RenderHtml html={note} />
      </DialogContent>
    </Dialog>
  );
}

// -------------- COLUMNS -------------- //
const columns: ColumnDef<AppraisalReportRow>[] = [
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
    cell: ({ row }: { row: { original: AppraisalReportRow } }) => (
      <div className="flex items-center space-x-2">
        {Avatars({
          name: row.original.employeeName,
        })}
        <div className="flex flex-col">
          <Link
            href={`/dashboard/performance/appraisals/participant/${row.original.appraisalId}`}
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
  {
    accessorKey: "appraisalScore",
    header: "Score",
    cell: ({ getValue }) =>
      getValue() ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "promotionRecommendation",
    header: "Promotion",
    cell: ({ getValue }) => {
      const val = getValue<string | null>();
      return (
        <Badge
          variant={
            val === "hold"
              ? "pending"
              : val && val !== "None"
                ? "outline"
                : "completed"
          }
          className="capitalize"
        >
          {val ? val : "None"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ getValue }) =>
      getValue() ? (
        new Date(getValue() as string).toLocaleString()
      ) : (
        <span>—</span>
      ),
  },
  {
    accessorKey: "appraisalNote",
    header: "Appraisal Note",
    cell: ({ row }) =>
      row.original.appraisalNote ? (
        <ViewNoteButton note={row.original.appraisalNote} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    enableSorting: false,
  },
];

// -------------- PAGE COMPONENT -------------- //
const AppraisalSummaryPage = () => {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [filters, setFilters] = useState<{
    cycleId?: string;
    employeeId?: string;
    departmentId?: string;
    minimumScore?: number;
    search?: string; // 👈 add this
  }>({});

  const {
    search, // destructure search out
    ...apiFilters
  } = filters;

  const {
    data: report = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["appraisal-report", apiFilters],
    queryFn: async () => {
      const res = await axios.get("/api/performance-report/appraisal-report", {
        params: { ...filters },
      });
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const filteredReport = React.useMemo(() => {
    if (!search) return report;
    const q = search.toLowerCase();
    return report.filter(
      (row: {
        employeeName: string;
        jobRoleName: string;
        departmentName: string;
      }) =>
        row.employeeName?.toLowerCase().includes(q) ||
        row.jobRoleName?.toLowerCase().includes(q) ||
        row.departmentName?.toLowerCase().includes(q),
    );
  }, [report, search]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Appraisal Summary</h1>
      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={refetch}
        appraisal={true}
        exportPath="/api/performance-report/export-appraisal-report"
      />
      <DataTable columns={columns} data={filteredReport} />
    </div>
  );
};

export default AppraisalSummaryPage;
