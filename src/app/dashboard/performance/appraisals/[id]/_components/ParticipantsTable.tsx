"use client";

import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { FaCheck, FaEye } from "react-icons/fa";
import { StatusBadge } from "@/shared/ui/status-badge";
import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";
import { Avatars } from "@/shared/ui/avatars";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { Appraisal } from "@/types/performance/appraisal.type";
import SendReminder from "./SendReminder";

function getStatus(row: Appraisal): {
  label: string;
  color: "submitted" | "completed" | "not_started" | "in_progress" | "draft";
} {
  const { submittedByEmployee, submittedByManager, finalized } = row;

  if (finalized) return { label: "Finalized", color: "completed" };
  if (submittedByEmployee && submittedByManager)
    return { label: "100% Complete", color: "submitted" };
  if (submittedByEmployee || submittedByManager)
    return { label: "50% Complete", color: "in_progress" };
  return { label: "Not Started", color: "not_started" };
}

const columns: ColumnDef<Appraisal & { progress: number }>[] = [
  {
    accessorKey: "employee",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {Avatars({ name: row.original.employeeName })}
        <div className="flex flex-col">
          <Link
            href={`/dashboard/performance/appraisals/participant/${row.original.id}`}
            className="text-monzo-brandDark"
          >
            <div className="capitalize font-semibold">
              {row.original.employeeName}
            </div>
          </Link>
          <span className="capitalize text-xs">
            {row.original.jobRoleName || "—"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "managerName",
    header: "Manager",
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
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
            <span className="text-sm font-medium min-w-[32px]">{value}%</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "finalScore",
    header: "Final Score",
    cell: ({ row }) => (
      <span>
        {row.original.finalScore !== null ? row.original.finalScore : "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = getStatus(row.original);
      return <StatusBadge status={status.color}>{status.label}</StatusBadge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/dashboard/performance/appraisals/participant/${row.original.id}`}
        >
          <Button size="sm" variant="link">
            <FaEye />
          </Button>
        </Link>
        <DeleteIconDialog itemId={row.original.id} type="participant" />
      </div>
    ),
  },
  {
    id: "reminder",
    header: () => <div className="text-center">Send Reminder</div>,
    cell: ({ row }) => <SendReminder employeeId={row.original.employeeId} />,
  },
];

type ParticipantsTableProps = {
  data: Appraisal[];
};

export default function ParticipantsTable({ data }: ParticipantsTableProps) {
  const dataWithProgress =
    data &&
    data?.map((d) => ({
      ...d,
      progress:
        d.finalized || (d.submittedByEmployee && d.submittedByManager)
          ? 100
          : d.submittedByEmployee || d.submittedByManager
            ? 50
            : 0,
    }));

  return (
    <div className="mt-6">
      <DataTable columns={columns} data={dataWithProgress} />
    </div>
  );
}
