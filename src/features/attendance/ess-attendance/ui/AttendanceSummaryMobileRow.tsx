"use client";

import { differenceInMinutes, format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import type { AttendanceRecord } from "../types/employee-attendance.types";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";

const minutesToHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceRecord["status"];
}) {
  return (
    <Badge
      variant={
        status === "present"
          ? "approved"
          : status === "absent"
            ? "rejected"
            : "pending"
      }
      className="capitalize"
    >
      {status}
    </Badge>
  );
}

const formatTime = (date: string, time?: string | null) => {
  if (!time || !date) return "—";
  const parsed = new Date(`${date}T${time}`);
  return isNaN(parsed.getTime()) ? "—" : format(parsed, "hh:mm a");
};

const totalWorked = (r: AttendanceRecord) => {
  const { checkInTime, checkOutTime, date } = r;
  if (!checkInTime || !checkOutTime || !date) return "—";
  const start = new Date(`${date}T${checkInTime}`);
  const end = new Date(`${date}T${checkOutTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
  return minutesToHHMM(differenceInMinutes(end, start));
};

export function AttendanceSummaryMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<AttendanceRecord>) {
  const r = row.original;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">
            {r.date ? format(new Date(r.date), "dd MMM yyyy") : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatTime(r.date, r.checkInTime)} →{" "}
            {formatTime(r.date, r.checkOutTime)}
          </div>
        </div>

        <div className="shrink-0">
          <AttendanceStatusBadge status={r.status} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Total worked</span>
          <span className="text-sm font-medium">{totalWorked(r)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Check in</span>
          <span className="text-sm font-medium">
            {formatTime(r.date, r.checkInTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Check out</span>
          <span className="text-sm font-medium">
            {formatTime(r.date, r.checkOutTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
