import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // ✅ Monday-like block
  "inline-flex h-8 min-w-[92px] items-center justify-center rounded-md px-3 text-xs font-semibold capitalize text-white shadow-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // 🟡 attention
        pending: "bg-amber-400 hover:bg-amber-500",
        ongoing: "bg-amber-400 hover:bg-amber-500",

        // 🟢 success
        paid: "bg-emerald-500 hover:bg-emerald-600",
        approved: "bg-emerald-500 hover:bg-emerald-600",

        // 🔵 info
        completed: "bg-sky-500 hover:bg-sky-600",

        // 🔴 problem
        rejected: "bg-rose-500 hover:bg-rose-600",

        // ⚪ neutral
        outline:
          "border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
