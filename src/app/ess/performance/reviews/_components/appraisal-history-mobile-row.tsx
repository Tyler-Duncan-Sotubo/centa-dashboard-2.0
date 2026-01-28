"use client";

import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import Link from "next/link";

type HistoryRow = {
  id: string;
  cycleName: string | null;
  createdAt: string;
  submittedByEmployee: boolean;
  submittedByManager: boolean;
  finalized: boolean;
  finalScore: number | null;
  managerName: string | null;
  departmentName: string | null;
  jobRoleName: string | null;
};

function statusForRow(row: HistoryRow) {
  if (row.finalized) return { label: "Finalized", color: "completed" as const };
  if (row.submittedByEmployee && row.submittedByManager)
    return { label: "100% Complete", color: "submitted" as const };
  if (row.submittedByEmployee || row.submittedByManager)
    return { label: "In Progress", color: "in_progress" as const };
  return { label: "Not Started", color: "not_started" as const };
}

export function AppraisalHistoryMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<HistoryRow>) {
  const r = row.original;
  const status = statusForRow(r);

  const href = `/ess/performance/reviews/${r.id}`;
  const canEdit = !r.finalized;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{r.cycleName ?? "—"}</div>

          <div className="mt-1 text-xs text-muted-foreground">
            Created{" "}
            {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : "—"}
          </div>
        </div>

        <StatusBadge status={status.color}>{status.label}</StatusBadge>
      </div>

      {/* Meta info */}
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Manager</span>
          <span className="font-medium">{r.managerName ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Department</span>
          <span className="font-medium">{r.departmentName ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Role</span>
          <span className="font-medium">{r.jobRoleName ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Final score</span>
          <span className="font-medium">
            {r.finalScore !== null ? r.finalScore : "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end">
        <Link href={href} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant={canEdit ? "default" : "outline"}>
            {canEdit
              ? r.submittedByEmployee
                ? "Edit Self Appraisal"
                : "Start Self Appraisal"
              : "View Results"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
