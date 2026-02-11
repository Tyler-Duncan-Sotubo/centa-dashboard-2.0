"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { formatToDisplay } from "@/shared/utils/formatToDisplay";
import { Avatars } from "@/shared/ui/avatars";
import { AttendanceStatusBadge } from "@/shared/ui/attendance-status-badge"; // ✅ NEW
import type { AttendanceSummaryItem } from "@/features/attendance/core/types/attendance.type";

export function safeFormatTime(
  value?: string | Date | null,
  fmt = "hh:mm a",
  fallback = "--",
) {
  if (!value) return fallback;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return fallback;
    return format(value, fmt);
  }

  if (typeof value === "string") {
    if (value.includes("T")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return format(d, fmt);
    }

    const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      let hours = Number(m[1]);
      const minutes = m[2];

      const isPM = hours >= 12;
      hours = hours % 12;
      if (hours === 0) hours = 12;

      const hh = fmt.includes("hh")
        ? String(hours).padStart(2, "0")
        : String(hours);
      const mm = minutes;

      return `${hh}:${mm} ${isPM ? "PM" : "AM"}`;
    }
  }

  return fallback;
}

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
    cell: ({ row }) => safeFormatTime(row.original.checkInTime),
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
    cell: ({ row }) => safeFormatTime(row.original.checkOutTime),
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
    cell: ({ row }) => (
      <div className="flex justify-center">
        <AttendanceStatusBadge
          status={row.original.status}
          className="min-h-10"
        />
      </div>
    ),
  },
];
