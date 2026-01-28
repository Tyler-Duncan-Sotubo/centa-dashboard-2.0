"use client";

import { Goal } from "@/types/performance/goals.type";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { FaCheck, FaEdit } from "react-icons/fa";
import Link from "next/link";
import GoalModal from "./GoalFormModal";
import { useState } from "react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { DeleteWithTwoIdsDialog } from "@/shared/ui/delete-with-two-Ids-dialog";
import { GoalsMobileRow } from "./goals-mobile-row";

interface GoalTableProps {
  goals: Goal[];
  disabledAction?: boolean;
}

interface GoalTableRowProps {
  row: {
    original: Goal;
  };
}

export default function GoalTable({
  goals,
  disabledAction = false,
}: GoalTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const columns: ColumnDef<Goal>[] = [
    {
      accessorKey: "title",
      header: "Goal",
      cell: ({ row }: GoalTableRowProps) => (
        <div>
          {row.original.status !== "archived" ? (
            <Link
              href={`/ess/performance/goals/${row.original.id}`}
              className="text-monzo-brandDark"
            >
              <div className="capitalize font-semibold">
                {row.original.title}
              </div>
            </Link>
          ) : (
            <div className="capitalize font-semibold">{row.original.title}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: GoalTableRowProps) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }: GoalTableRowProps) => {
        const value = row.original.progress;

        let color = "bg-muted-foreground";
        if (value < 40) color = "bg-red-500";
        else if (value < 80) color = "bg-yellow-500";
        else color = "bg-green-600";

        return (
          <div className="flex items-center gap-2 w-40">
            <div className="w-full h-3 rounded-full bg-muted relative overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${value}%` }}
              />
            </div>

            {value === 100 ? (
              <span className="ml-1 text-green-600 text-sm">
                <FaCheck />
              </span>
            ) : (
              <span className="text-sm font-medium min-w-8">{value}%</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }: GoalTableRowProps) => `${row.original.weight}%`,
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      cell: ({ row }: GoalTableRowProps) =>
        format(new Date(row.original.dueDate), "MMMM do, yyyy"),
    },
    !disabledAction && {
      id: "actions",
      header: "Actions",
      cell: ({ row }: GoalTableRowProps) => {
        const goal = row.original;

        return (
          <div className="flex items-center">
            {goal.status !== "archived" && (
              <>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setOpen(true);
                  }}
                >
                  <FaEdit />
                </Button>

                <DeleteWithTwoIdsDialog
                  id1={goal.id}
                  id2={goal.employeeId}
                  buildEndpoint={(goalId, employeeId) =>
                    `/api/performance-goals/${goalId}/${employeeId}/archive`
                  }
                  successMessage="Goal archived successfully"
                  refetchKey="goals"
                />
              </>
            )}
          </div>
        );
      },
    },
  ].filter(Boolean) as ColumnDef<Goal>[];

  return (
    <div className="mt-4">
      <DataTable
        columns={columns}
        data={goals}
        mobileRow={GoalsMobileRow}
        // optional if you want: hideTableOnMobile
        // hideTableOnMobile
      />
      <GoalModal open={open} setOpen={setOpen} initialData={selectedGoal} />
    </div>
  );
}
