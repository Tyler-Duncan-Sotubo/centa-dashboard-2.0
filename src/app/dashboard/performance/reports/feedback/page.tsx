"use client";

import React, { useState } from "react";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import { DataTable } from "@/shared/ui/data-table";
import { ReportFilters } from "../_components/ReportFilters";
import { Avatars } from "@/shared/ui/avatars";
import { ChevronsUpDown } from "lucide-react";

// ---------- TYPES ----------
type FeedbackReportRow = {
  feedbackId: string;
  recipientId: string;
  isAnonymous: boolean;
  submittedAt: string;
  senderId: string;
  employeeName: string;
  senderName?: string;
  responses: {
    questionText: string;
    answer: string;
    order: number;
  }[];
};

// ---------- RESPONSES VIEW DIALOG ----------
function ViewResponsesDialog({
  responses,
}: {
  responses: FeedbackReportRow["responses"];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <div>
          <h2 className="font-bold mb-2">Feedback Responses</h2>
          <ul className="space-y-4">
            {responses.map((r, idx) => (
              <li key={idx}>
                <div className="font-medium">{r.questionText}</div>
                <div className="pl-2 text-muted-foreground">{r.answer}</div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- TABLE COLUMNS ----------
const columns: ColumnDef<FeedbackReportRow, unknown>[] = [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: (ctx: CellContext<FeedbackReportRow, unknown>) => (
      <div className="flex items-center space-x-2">
        {Avatars({ name: ctx.row.original.employeeName })}
        <div className="flex flex-col">
          <div className="capitalize font-semibold">
            {ctx.row.original.employeeName}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "isAnonymous",
    header: "Anonymous?",
    cell: (ctx: CellContext<FeedbackReportRow, unknown>) =>
      ctx.getValue() ? (
        <Badge variant="outline" className="text-xs">
          Anonymous
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          Named
        </Badge>
      ),
  },
  {
    accessorKey: "senderName",
    header: "Sender",
    cell: (ctx: CellContext<FeedbackReportRow, unknown>) =>
      ctx.row.original.isAnonymous ? (
        <span className="italic text-muted-foreground">Hidden</span>
      ) : (
        <span>{ctx.row.original.senderName || "—"}</span>
      ),
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: (ctx: CellContext<FeedbackReportRow, unknown>) =>
      ctx.getValue() ? (
        new Date(String(ctx.getValue())).toLocaleString()
      ) : (
        <span>—</span>
      ),
  },
  {
    accessorKey: "responses",
    header: "Responses",
    enableSorting: false,
    cell: (ctx: CellContext<FeedbackReportRow, unknown>) =>
      ctx.row.original.responses && ctx.row.original.responses.length > 0 ? (
        <ViewResponsesDialog responses={ctx.row.original.responses} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

// ---------- PAGE COMPONENT ----------
const FeedbackReportPage = () => {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [filters, setFilters] = useState<{
    type?: string;
    employeeId?: string;
    departmentId?: string;
    search?: string;
  }>({
    type: "peer", // Default filter!
  });

  const { search, ...apiFilters } = filters;

  const {
    data: report = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["feedback-report", apiFilters],
    queryFn: async () => {
      const res = await axios.get("/api/performance-report/feedback-report", {
        params: { ...apiFilters },
      });
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  // Local search
  const filteredReport = React.useMemo(() => {
    if (!search) return report;
    const q = search.toLowerCase();
    return report.filter(
      (row: FeedbackReportRow) =>
        row.employeeName?.toLowerCase().includes(q) ||
        row.senderName?.toLowerCase().includes(q),
    );
  }, [report, search]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading feedback report</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Feedback Report</h1>
      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={refetch}
        exportPath="/api/performance-report/export-feedback-report"
        allowedFormats={["csv", "pdf"]}
        showType={true}
        showEmployee={true}
        showDepartment={false}
        showCycle={false}
        showMinimumScore={false}
        showSearch={true}
      />
      <DataTable columns={columns} data={filteredReport} />
    </div>
  );
};

export default FeedbackReportPage;
