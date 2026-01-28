"use client";

import React from "react";
import PageHeader from "@/shared/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Progress } from "@/shared/ui/progress";
import { AppraisalHistoryMobileRow } from "./_components/appraisal-history-mobile-row";

type HistoryRow = {
  id: string;
  cycleId: string;
  cycleName: string | null;
  createdAt: string;
  submittedByEmployee: boolean;
  submittedByManager: boolean;
  finalized: boolean;
  finalScore: number | null;
  employeeName: string;
  managerName: string | null;
  departmentName: string | null;
  jobRoleName: string | null;
};

type DashboardData = {
  currentCycle: null | {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  currentCycleAppraisal: null | {
    id: string;
    submittedByEmployee: boolean;
    submittedByManager: boolean;
    finalized: boolean;
    finalScore: number | null;
  };
  history: HistoryRow[];
};

function statusForRow(row: HistoryRow) {
  if (row.finalized) return { label: "Finalized", color: "completed" as const };
  if (row.submittedByEmployee && row.submittedByManager)
    return { label: "100% Complete", color: "submitted" as const };
  if (row.submittedByEmployee || row.submittedByManager)
    return { label: "In Progress", color: "in_progress" as const };
  return { label: "Not Started", color: "not_started" as const };
}

export default function AppraisalPage() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["appraisals:employee-dashboard"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/appraisals/${session?.user.id}/participants`,
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError || !data) return <p>Error loading appraisals</p>;

  const { currentCycle, currentCycleAppraisal, history } = data;

  // Card computed state
  const meSubmitted = !!currentCycleAppraisal?.submittedByEmployee;
  const mgrSubmitted = !!currentCycleAppraisal?.submittedByManager;
  const finalized = !!currentCycleAppraisal?.finalized;

  const progress =
    finalized || (meSubmitted && mgrSubmitted)
      ? 100
      : meSubmitted || mgrSubmitted
        ? 50
        : 0;

  const daysLeft = currentCycle
    ? differenceInCalendarDays(new Date(currentCycle.endDate), new Date())
    : null;

  let cardMessage = "You can now submit your self-assessment.";
  let actionLabel = "Complete Self Appraisal";

  if (finalized) {
    cardMessage = "Your appraisal is finalized. View the results.";
    actionLabel = "View Results";
  } else if (meSubmitted && mgrSubmitted) {
    cardMessage = "You and your manager have submitted. Awaiting finalization.";
    actionLabel = "View";
  } else if (meSubmitted && !mgrSubmitted) {
    cardMessage = "You've submitted. Waiting for your manager's review.";
    actionLabel = "View Submission";
  } else if (!meSubmitted && mgrSubmitted) {
    cardMessage =
      "Your manager has submitted. Please complete your self-assessment.";
    actionLabel = "Complete Self Appraisal";
  }

  // History table
  const columns: ColumnDef<HistoryRow & { progress: number }>[] = [
    {
      accessorKey: "cycleName",
      header: "Cycle",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.cycleName ?? "—"}</div>
      ),
    },

    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = statusForRow(row.original);
        return <StatusBadge status={s.color}>{s.label}</StatusBadge>;
      },
    },
    {
      accessorKey: "managerName",
      header: "Manager",
      cell: ({ row }) => <div>{row.original.managerName ?? "—"}</div>,
    },
    {
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ row }) => <div>{row.original.departmentName ?? "—"}</div>,
    },
    {
      accessorKey: "jobRoleName",
      header: "Job Role",
      cell: ({ row }) => <div>{row.original.jobRoleName ?? "—"}</div>,
    },

    {
      accessorKey: "finalScore",
      header: "Final Score",
      cell: ({ row }) =>
        row.original.finalScore !== null ? row.original.finalScore : "—",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "PPP")
          : "—",
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const href = `/ess/performance/reviews/${row.original.id}`;
        const me = row.original.submittedByEmployee;
        const fin = row.original.finalized;
        return (
          <div>
            {!fin && (
              <Link href={`/ess/performance/reviews/${row.original.id}`}>
                <Button size="sm" variant="default" className="ml-2">
                  {me ? "Edit Self Appraisal" : "Start Self Appraisal"}
                </Button>
              </Link>
            )}
            {fin && (
              <Link href={href}>
                <Button size="sm" variant="outline" className="ml-2">
                  View Results and Sign
                </Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const dataWithProgress =
    history?.map((h) => ({
      ...h,
      progress:
        h.finalized || (h.submittedByEmployee && h.submittedByManager)
          ? 100
          : h.submittedByEmployee || h.submittedByManager
            ? 50
            : 0,
    })) ?? [];

  return (
    <div>
      <PageHeader
        title="Appraisals"
        description="Submit your self-evaluation and view past reviews."
      />

      {/* Current Cycle Card */}
      {currentCycle ? (
        <Card className="mt-6 max-w-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentCycle.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {format(new Date(currentCycle.startDate), "PPP")} –{" "}
                  {format(new Date(currentCycle.endDate), "PPP")}
                </p>
              </div>

              {/* Deadline pill (<= 10 days remaining) */}
              {typeof daysLeft === "number" &&
                daysLeft <= 10 &&
                daysLeft >= 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Due in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                  </span>
                )}
            </div>
          </CardHeader>

          <CardContent className="mt-2 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-md font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} max={100} />
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className={meSubmitted ? "text-green-600" : ""}>
                  You: {meSubmitted ? "Submitted" : "Not submitted"}
                </span>
                <span>•</span>
                <span className={mgrSubmitted ? "text-green-600" : ""}>
                  Manager: {mgrSubmitted ? "Submitted" : "Not submitted"}
                </span>
              </div>
            </div>

            {/* Message + Action */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{cardMessage}</div>

              {currentCycleAppraisal ? (
                <Link
                  href={`/ess/performance/reviews/${currentCycleAppraisal.id}`}
                >
                  <Button variant="default">{actionLabel}</Button>
                </Link>
              ) : (
                <Link
                  href={`/ess/performance/appraisals/self?cycleId=${currentCycle.id}`}
                >
                  <Button variant="default">Start Self Appraisal</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="mt-6 text-muted-foreground">
          No active appraisal cycle at the moment.
        </p>
      )}

      {/* History Table */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold">Appraisals History</h3>
        <DataTable
          columns={columns}
          data={dataWithProgress}
          mobileRow={AppraisalHistoryMobileRow as any}
        />
      </div>
    </div>
  );
}
