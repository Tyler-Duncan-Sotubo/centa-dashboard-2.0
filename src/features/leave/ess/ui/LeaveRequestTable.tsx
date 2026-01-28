"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import {
  DataTable,
  type DataTableMobileRowProps,
} from "@/shared/ui/data-table";

type LeaveRequestRow = {
  requestId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
};

function LeaveStatusBadge({ status }: { status: LeaveRequestRow["status"] }) {
  return (
    <Badge
      variant={
        status === "approved"
          ? "approved"
          : status === "rejected"
            ? "rejected"
            : "pending"
      }
      className="capitalize"
    >
      {status}
    </Badge>
  );
}

function LeaveRequestsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<LeaveRequestRow>) {
  const r = row.original;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{r.leaveType}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {format(new Date(r.startDate), "dd MMM yyyy")} –{" "}
            {format(new Date(r.endDate), "dd MMM yyyy")}
          </div>
        </div>

        <div className="shrink-0">
          <LeaveStatusBadge status={r.status} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs text-muted-foreground">Reason</span>
          <span className="text-sm font-medium text-right line-clamp-2 max-w-[70%]">
            {r.reason || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LeaveRequestTable({
  data,
}: {
  data: LeaveRequestRow[];
}) {
  const [filter, setFilter] = useState<"all" | LeaveRequestRow["status"]>(
    "all",
  );

  const filtered = useMemo(() => {
    return filter === "all"
      ? data
      : data.filter((r) => r.status.toLowerCase() === filter);
  }, [filter, data]);

  const columns: ColumnDef<LeaveRequestRow>[] = [
    { accessorKey: "leaveType", header: "Leave Type" },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) =>
        format(new Date(row.original.startDate), "dd MMM yyyy"),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => format(new Date(row.original.endDate), "dd MMM yyyy"),
    },
    { accessorKey: "reason", header: "Reason" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Leave Requests</h3>

        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        mobileRow={LeaveRequestsMobileRow}
        hideTableOnMobile
      />
    </div>
  );
}
