"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import { User, UserCheck, Clock } from "lucide-react";
import { intervalToDuration, formatDuration, parseISO } from "date-fns";

const getTimeInPosition = (effectiveDate?: string | null) => {
  if (!effectiveDate) return "N/A";

  const start = parseISO(effectiveDate);
  const now = new Date();

  const duration = intervalToDuration({ start, end: now });

  // if less than 1 month → show days
  if (!duration.years && !duration.months) {
    return `${duration.days ?? 0} day${duration.days === 1 ? "" : "s"}`;
  }

  // if less than 1 year → show months + days
  if (!duration.years) {
    return formatDuration(duration, { format: ["months", "days"] });
  }

  // 1y+ → show years + months
  return formatDuration(duration, { format: ["years", "months"] });
};

export default function EmployeeQuickProfile({ employee }: { employee: any }) {
  if (!employee) return null;

  const fullName = `${employee.first_name ?? ""} ${
    employee.last_name ?? ""
  }`.trim();

  return (
    <div className="flex flex-col mb-20">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="w-32 h-32 ring-2 ring-border">
          <AvatarImage src={employee.avatar ?? undefined} alt={fullName} />
          <AvatarFallback>
            <User className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 space-y-1">
          <div className="text-base font-semibold text-foreground">
            {fullName}
          </div>

          {employee.job_role && (
            <div className="text-sm text-muted-foreground">
              {employee.job_role}
            </div>
          )}

          {(employee.department_name || employee.location) && (
            <div className="text-xs text-muted-foreground">
              {employee.department_name}
              {employee.department_name && employee.location && ", "}
              {employee.location}
            </div>
          )}
        </div>
      </div>

      {/* ================= REPORTS TO ================= */}
      <Separator className="my-5" />

      <div className="flex items-center gap-3 text-sm">
        <UserCheck className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Reports to</span>
        <span className="font-medium text-foreground">
          {employee.employeeManager?.name ?? "N/A"}
        </span>
      </div>

      {/* ================= TIME IN POSITION ================= */}
      {/* <Separator className="my-5" /> */}

      {/* <div className="flex items-center gap-3 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Time in position</span>
        <span className="font-medium text-foreground">
          {getTimeInPosition(employee.effectiveDate)}
        </span>
      </div> */}
    </div>
  );
}
