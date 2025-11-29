"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";

type LeaveRequestRow = {
  requestId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
};

export default function LeaveRequestTable({
  data,
}: {
  data: LeaveRequestRow[];
}) {
  const [filter, setFilter] = useState("all");

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
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "approved"
              ? "approved"
              : row.original.status === "rejected"
              ? "rejected"
              : "pending"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Leave Requests</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "rejected"].map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
