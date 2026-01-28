"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import DataTableRowActions from "@/shared/ui/data-table-row-actions";
import { Avatars } from "@/shared/ui/avatars";
import { DataTable } from "@/shared/ui/data-table";

export type LeaveRequest = {
  requestId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  department?: string;
  totalDays: string;
};

/* ------------------ Columns ------------------ */

export const leaveColumns: ColumnDef<LeaveRequest>[] = [
  {
    id: "custom_id",
    header: () => <span>#</span>,
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `${index.toString().padStart(2)}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {Avatars({ name: row.original.employeeName })}
        <div className="capitalize font-semibold">
          {row.original.employeeName}
        </div>
      </div>
    ),
  },
  {
    id: "dateRange",
    header: "Start Date",
    cell: ({ row }) => {
      const { startDate, endDate, totalDays } = row.original;
      const start = new Date(startDate);
      const end = new Date(endDate);

      return (
        <div>
          <div>{`${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`}</div>
          <div className="text-xs text-muted-foreground">
            {Number(totalDays)} day(s)
          </div>
        </div>
      );
    },
  },
  {
    id: "leaveType",
    header: "Leave Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.leaveType}</div>
    ),
  },
  {
    id: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.reason ?? "—"}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      return (
        <Badge
          variant={
            status === "approved"
              ? "approved"
              : status === "pending"
                ? "pending"
                : "rejected"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableRowActions
          row={row}
          basePath="leave-requests"
          getId={(data) => data?.requestId}
        />
      </div>
    ),
  },
];

/* ------------------ Component ------------------ */

export function LeaveRequestsTable({
  data,
}: {
  data: LeaveRequest[] | undefined;
}) {
  return (
    <DataTable
      columns={leaveColumns}
      data={data ?? []}
      filterKey="employeeName"
      filterPlaceholder="Filter name..."
    />
  );
}
