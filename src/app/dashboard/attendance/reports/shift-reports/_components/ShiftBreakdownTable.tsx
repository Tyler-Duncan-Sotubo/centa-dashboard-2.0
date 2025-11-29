"use client";

import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShiftBreakdownRow } from "@/types/shift.type";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";

const columns: ColumnDef<ShiftBreakdownRow>[] = [
  {
    id: "custom_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        #
      </Button>
    ),
    cell: ({ row }) => {
      const index = row.index + 1; // Ensure it starts from 1
      const formattedId = `${index.toString().padStart(2)}`; // D0001, D0002...
      return <div className="capitalize">{formattedId}</div>;
    },
  },

  {
    accessorKey: "employee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.employeeName as string;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-14 h-14">
            <AvatarFallback>
              <div className="bg-monzo-background w-20 h-20 text-white flex items-center justify-center font-bold">
                {initials}
              </div>
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="capitalize font-semibold">
              {row.original.employeeName}
            </div>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "employeeName", header: "Employee" },
  { accessorKey: "shiftName", header: "Shift" },
  { accessorKey: "locationName", header: "Location" },
  {
    header: "Time",
    cell: ({ row }) => (
      <span>
        {row.original.startTime} - {row.original.endTime}
      </span>
    ),
  },
  { accessorKey: "daysScheduled", header: "Scheduled" },
  { accessorKey: "daysPresent", header: "Present" },
  { accessorKey: "daysExpected", header: "Expected" },
  {
    header: "Missed",
    cell: ({ row }) => (
      <span>
        {Number(row.original.daysScheduled) - Number(row.original.daysPresent)}
      </span>
    ),
  },
];

export function ShiftBreakdownTable({ data }: { data: ShiftBreakdownRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
