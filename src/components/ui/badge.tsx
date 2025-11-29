import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const colors = {
  brand: "bg-brand hover:bg-brand/80",
  success: "bg-success hover:bg-success/80",
  warning: "bg-warning hover:bg-warning/80",
  error: "bg-error hover:bg-error/80",
};

const badgeVariants = cva(
  "inline-flex items-center rounded-md border capitalize px-3 py-1 text-xs font-semibold text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        pending: colors.warning,
        ongoing: colors.warning,
        paid: colors.success,
        completed: colors.brand,
        approved: colors.success,
        rejected: colors.error,
        outline:
          "border-muted text-foreground bg-transparent hover:bg-muted/10", // New outline variant
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
