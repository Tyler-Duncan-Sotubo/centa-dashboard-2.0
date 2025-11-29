"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatars } from "@/components/avatars";
import { OffboardingSession } from "@/types/offboarding/offboarding.type";
import { formatSource } from "@/utils/formatSource";
import OffboardingChecklistModal from "./OffboardingChecklistModal";

const columns: ColumnDef<OffboardingSession>[] = [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee Name <ChevronsUpDown className="ml-1 h-4 w-4" />
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
    accessorKey: "jobRole",
    header: "Job Role",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "terminationType",
    header: "Type",
  },
  {
    accessorKey: "terminationReason",
    header: "Reason",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OffboardingSession["status"];
      const variant =
        status === "completed"
          ? "completed"
          : status === "in_progress"
          ? "ongoing"
          : "pending";
      return (
        <Badge variant={variant}>{status ? formatSource(status) : null}</Badge>
      );
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const { checklist, employeeName } = row.original;
      return (
        <OffboardingChecklistModal
          checklist={checklist}
          employeeName={employeeName}
        />
      );
    },
  },
];

export default function OffboardingEmployeesTable({
  data,
}: {
  data: OffboardingSession[] | undefined;
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = data?.filter((item) =>
    statusFilter === "all" ? true : item.status === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData ?? []} />
    </div>
  );
}
