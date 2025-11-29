"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OnboardingChecklistModal from "./OnboardingChecklistModal";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatars } from "@/components/avatars";
import { OnboardingEmployee } from "@/types/onboarding/onboarding.type";

const columns: ColumnDef<OnboardingEmployee>[] = [
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
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {Avatars({
            name: row.original.employeeName,
          })}
          <div className="capitalize font-semibold">
            {row.original.employeeName}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OnboardingEmployee["status"];
      const variant =
        status === "completed"
          ? "completed"
          : status === "in_progress"
          ? "ongoing"
          : "pending";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ row }) => {
      const date = row.getValue("startedAt") as string;
      return <span>{format(new Date(date), "PPP")}</span>;
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const checklist = row.original.checklist;
      return (
        <OnboardingChecklistModal
          checklist={checklist}
          employeeName={row.original.employeeName}
          employeeId={row.original.employeeId}
        />
      );
    },
  },
];

export default function OnboardingEmployeesTable({
  data,
}: {
  data: OnboardingEmployee[] | undefined;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = data?.filter((item) =>
    statusFilter === "all" ? true : item.status === statusFilter
  );

  return (
    <div className="space-y-4">
      <>
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
      </>
    </div>
  );
}
