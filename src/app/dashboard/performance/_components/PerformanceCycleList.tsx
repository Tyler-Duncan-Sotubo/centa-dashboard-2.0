// PerformanceCycleList.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { format } from "date-fns";
import { StatusBadge } from "@/shared/ui/status-badge";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import CreateCycleModal from "./CreateCycleModal";

export type PerformanceCycle = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
};

export default function PerformanceCycleList({
  cycles,
}: {
  cycles: PerformanceCycle[];
}) {
  const [editing, setEditing] = useState<PerformanceCycle | null>(null);

  const columns: ColumnDef<PerformanceCycle>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Performance Cycle Name",
        cell: ({ row }) => (
          <p className="font-semibold py-3">{row.original.name}</p>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) =>
          row.original.startDate
            ? format(new Date(row.original.startDate), "dd MMM yyyy")
            : "Not Started",
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) =>
          row.original.endDate
            ? format(new Date(row.original.endDate), "dd MMM yyyy")
            : "Ongoing",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className="capitalize">
            <StatusBadge
              status={
                row.original.status as
                  | "upcoming"
                  | "active"
                  | "closed"
                  | "all"
                  | "archived"
                  | "submitted"
                  | "completed"
                  | "published"
                  | "in_progress"
                  | "not_started"
                  | "overdue"
                  | "draft"
                  | "pending_approval"
              }
            />
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-left">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Button
              size="sm"
              variant="link"
              onClick={() => setEditing(row.original)}
            >
              <FaEdit className="mr-1" />
            </Button>
            <DeleteIconDialog itemId={row.original.id} type="cycle" />
          </div>
        ),
      },
      {
        id: "view",
        cell: ({ row }) => (
          <Link href={`/dashboard/performance/reviews/${row.original.id}`}>
            <Button variant="link">View Details</Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={cycles}
        filterKey="name"
        filterPlaceholder="Search cycles..."
        disableRowSelection
      />
      <CreateCycleModal
        open={Boolean(editing)}
        setOpen={(val) => {
          if (!val) setEditing(null);
        }}
        initialData={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                startDate: editing.startDate ?? "",
                endDate: editing.endDate ?? "",
              }
            : undefined
        }
      />
    </>
  );
}
