import type { ColumnDef } from "@tanstack/react-table";
import { differenceInMinutes, format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import type { AttendanceRecord } from "../types/employee-attendance.types";

const minutesToHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export const attendanceSummaryColumns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.date), "dd MMM yyyy"),
    meta: { className: "text-center" },
  },
  {
    accessorKey: "checkInTime",
    header: "Check In",
    cell: ({ row }) => {
      const { checkInTime, date } = row.original;
      if (!checkInTime || !date) return "—";
      const parsed = new Date(`${date}T${checkInTime}`);
      return isNaN(parsed.getTime()) ? "—" : format(parsed, "hh:mm a");
    },
    meta: { className: "text-center" },
  },
  {
    accessorKey: "checkOutTime",
    header: "Check Out",
    cell: ({ row }) => {
      const { checkOutTime, date } = row.original;
      if (!checkOutTime || !date) return "—";
      const parsed = new Date(`${date}T${checkOutTime}`);
      return isNaN(parsed.getTime()) ? "—" : format(parsed, "hh:mm a");
    },
    meta: { className: "text-center" },
  },
  {
    id: "totalWorked",
    header: "Total Worked",
    cell: ({ row }) => {
      const { checkInTime, checkOutTime, date } = row.original;
      if (!checkInTime || !checkOutTime || !date) return "—";

      const start = new Date(`${date}T${checkInTime}`);
      const end = new Date(`${date}T${checkOutTime}`);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";

      return minutesToHHMM(differenceInMinutes(end, start));
    },
    meta: { className: "text-center" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "present"
            ? "approved"
            : row.original.status === "absent"
              ? "rejected"
              : "pending"
        }
      >
        {row.original.status}
      </Badge>
    ),
    meta: { className: "text-center" },
  },
];
