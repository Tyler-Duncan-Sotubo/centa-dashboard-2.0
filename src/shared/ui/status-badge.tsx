import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const squareBadgeVariants = cva(
  // ✅ Monday.com style block
  "inline-flex h-8 min-w-[92px] items-center justify-center rounded-md px-3 text-xs font-semibold capitalize text-white shadow-sm",
  {
    variants: {
      status: {
        // 🟢 success
        active: "bg-emerald-500 border-emerald-600",
        closed: "bg-emerald-500 border-emerald-600",
        submitted: "bg-emerald-500 border-emerald-600",
        completed: "bg-emerald-500 border-emerald-600",

        // 🟡 working / pending
        in_progress: "bg-amber-400 border-amber-500",
        pending_approval: "bg-amber-400 border-amber-500",

        // 🔵 info
        upcoming: "bg-sky-500 border-sky-600",
        published: "bg-sky-500 border-sky-600",
        all: "bg-sky-500 border-sky-600",

        // 🔴 problem
        overdue: "bg-rose-500 border-rose-600",

        // ⚪ neutral
        archived: "bg-slate-200 border-slate-300 text-slate-700",
        draft: "bg-slate-200 border-slate-300 text-slate-700",
        not_started: "bg-slate-200 border-slate-300 text-slate-700",
        not_submitted: "bg-slate-200 border-slate-300 text-slate-700",
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  },
);

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof squareBadgeVariants> {}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const label = status?.replace(/_/g, " ") ?? "unknown";

  return (
    <div className={cn(squareBadgeVariants({ status }), className)} {...props}>
      {label}
    </div>
  );
}
