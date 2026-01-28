import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const squareBadgeVariants = cva(
  "inline-block rounded-sm px-3 py-2 text-sm capitalize font-bold text-monzo-textPrimary text-center min-w-[80px] border-l-4",
  {
    variants: {
      status: {
        upcoming: "bg-monzo-secondary/85 border-monzo-secondary text-black",
        active: "bg-success/85 border-success",
        closed: "bg-success/85 border-success",
        all: "bg-brand/85 border-brand",
        archived: "bg-monzo-textSecondary/85 border-monzo-textSecondary",
        submitted: "bg-success/85 border-success",
        completed: "bg-success/85 border-success",
        published: "bg-brand/85 border-brand",
        in_progress: "bg-warning/85 border-warning",
        not_started: "bg-muted-foreground/85 border-muted-foreground",
        overdue: "bg-error/85 border-error",
        draft: "bg-monzo-textSecondary/85 border-monzo-textSecondary",
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof squareBadgeVariants> {}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const label = status?.replace(/_/g, " ") ?? "unknown";
  return (
    <div className={cn(squareBadgeVariants({ status }), className)} {...props}>
      {label}
    </div>
  );
}
