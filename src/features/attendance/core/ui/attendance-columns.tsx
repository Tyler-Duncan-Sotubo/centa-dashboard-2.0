"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { ChevronsUpDown, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { formatToDisplay } from "@/shared/utils/formatToDisplay";
import { Avatars } from "@/shared/ui/avatars";

import type { AttendanceSummaryItem } from "@/features/attendance/core/types/attendance.type";

export const attendanceColumns: ColumnDef<AttendanceSummaryItem>[] = [
  {
    accessorKey: "employeeNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.employeeNumber}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ChevronsUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {Avatars({ name: row.original.name })}
        <div className="capitalize font-semibold">{row.original.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Department
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.department}</span>
    ),
  },
  {
    accessorKey: "checkInTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Check In
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const time = row.original.checkInTime;
      return time ? format(new Date(time), "hh:mm a") : "--";
    },
  },
  {
    accessorKey: "totalWorkedMinutes",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Worked
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const minutes = row.original.totalWorkedMinutes;
      return minutes ? formatToDisplay(minutes) : "--";
    },
  },
  {
    accessorKey: "checkOutTime",
    header: "Check Out",
    cell: ({ row }) => {
      const time = row.original.checkOutTime;
      return time ? format(new Date(time), "hh:mm a") : "--";
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "present"
              ? "approved"
              : status === "absent"
                ? "rejected"
                : "pending"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];
