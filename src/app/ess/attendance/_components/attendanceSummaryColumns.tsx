import { ColumnDef } from "@tanstack/react-table";
import { format, differenceInMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

type AttendanceRecord = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "present" | "absent" | "late";
};

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

      const dateTimeString = `${date}T${checkInTime}`;
      const parsedDate = new Date(dateTimeString);

      return isNaN(parsedDate.getTime()) ? "—" : format(parsedDate, "hh:mm a");
    },
    meta: { className: "text-center" },
  },
  {
    accessorKey: "checkOutTime",
    header: "Check Out",
    cell: ({ row }) => {
      const { checkOutTime, date } = row.original;
      if (!checkOutTime || !date) return "—";

      const dateTimeString = `${date}T${checkOutTime}`;
      const parsedDate = new Date(dateTimeString);

      return isNaN(parsedDate.getTime()) ? "—" : format(parsedDate, "hh:mm a");
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

      const mins = differenceInMinutes(end, start);
      return minutesToHHMM(mins);
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
