import React from "react";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { AttendanceStatusBadge } from "@/shared/ui/attendance-status-badge";

interface AttendanceEntry {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "present" | "absent" | "late";
}

interface AttendanceData {
  summaryList: AttendanceEntry[];
}

interface Props {
  attendance: AttendanceData;
}

const attendanceColumns: ColumnDef<AttendanceEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("date")).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "checkInTime",
    header: "Check-In",
    cell: ({ row }) => row.getValue("checkInTime") || "—",
  },
  {
    accessorKey: "checkOutTime",
    header: "Check-Out",
    cell: ({ row }) => row.getValue("checkOutTime") || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as AttendanceEntry["status"];
      return (
        <div className="py-1">
          <AttendanceStatusBadge status={status} className="min-h-9" />
        </div>
      );
    },
  },
];

export default function AttendanceComponent({ attendance }: Props) {
  const summaryList = attendance.summaryList;

  const total = summaryList.length;
  const present = summaryList.filter((e) => e.status === "present").length;
  const absent = summaryList.filter((e) => e.status === "absent").length;
  const late = summaryList.filter((e) => e.status === "late").length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold my-4">Attendance This Month</h2>
      {/* Summary Cards */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow-lg border flex items-center gap-4">
          <FiCalendar className="text-primary w-6 h-6" />
          <div>
            <p className="text-sm">Total Days</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg shadow-lg border flex items-center gap-4">
          <FiCheckCircle className="text-green-600 w-6 h-6" />
          <div>
            <p className="text-sm">Present</p>
            <p className="text-xl font-bold text-green-600">{present}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg shadow-lg border flex items-center gap-4">
          <FiXCircle className="text-red-600 w-6 h-6" />
          <div>
            <p className="text-sm">Absent</p>
            <p className="text-xl font-bold text-red-600">{absent}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg shadow-lg border flex items-center gap-4">
          <FiClock className="text-yellow-500 w-6 h-6" />
          <div>
            <p className="text-sm">Late</p>
            <p className="text-xl font-bold text-yellow-500">{late}</p>
          </div>
        </div>
      </div>
      {/* Table */}
      <h3 className="text-xl font-semibold mb-4">Attendance Records</h3>
      <DataTable columns={attendanceColumns} data={summaryList} />
    </div>
  );
}
