// ✅ AttendanceStatusBadge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const attendanceStatusVariants = cva(
  // Monday-like: full-height pill/rect, centered, compact text
  "inline-flex h-full min-w-[100px] items-center justify-center rounded-md px-2 text-xs font-semibold capitalize leading-none",
  {
    variants: {
      status: {
        present: "bg-emerald-500 text-white",
        late: "bg-amber-500 text-white",
        absent: "bg-rose-500 text-white",
        weekend: "bg-slate-200 text-slate-700",
      },
    },
    defaultVariants: {
      status: "weekend",
    },
  },
);

export type AttendanceStatus = "present" | "late" | "absent" | "weekend";

export interface AttendanceStatusBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof attendanceStatusVariants> {
  status: AttendanceStatus;
}

export function AttendanceStatusBadge({
  className,
  status,
  ...props
}: AttendanceStatusBadgeProps) {
  return (
    <div
      className={cn(attendanceStatusVariants({ status }), className)}
      {...props}
    >
      {status}
    </div>
  );
}
