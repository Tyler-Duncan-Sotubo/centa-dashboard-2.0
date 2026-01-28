"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FaCheck } from "react-icons/fa";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Goal } from "@/types/performance/goals.type";
import { StatusBadge } from "@/shared/ui/status-badge";

export function GoalsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Goal>) {
  const g = row.original;

  const value = g.progress ?? 0;

  let color = "bg-muted-foreground";
  if (value < 40) color = "bg-red-500";
  else if (value < 80) color = "bg-yellow-500";
  else color = "bg-green-600";

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(g)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {g.status !== "archived" ? (
            <Link
              href={`/ess/performance/goals/${g.id}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span className="capitalize line-clamp-1">{g.title}</span>
            </Link>
          ) : (
            <div className="font-semibold capitalize line-clamp-1">
              {g.title}
            </div>
          )}

          <div className="mt-1 text-xs text-muted-foreground">
            Due: {g.dueDate ? format(new Date(g.dueDate), "dd MMM yyyy") : "—"}
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={g.status} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-sm font-medium flex items-center gap-2">
            {value === 100 ? (
              <span className="text-green-600">
                <FaCheck />
              </span>
            ) : null}
            {value}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-muted relative overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${value}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Weight</span>
          <span className="text-sm font-medium">{g.weight ?? 0}%</span>
        </div>
      </div>
    </div>
  );
}
