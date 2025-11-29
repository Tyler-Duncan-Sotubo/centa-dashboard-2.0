"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { FaEdit } from "react-icons/fa";
// import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { format } from "date-fns";
import AppraisalCycleModal from "./AppraisalCycleModal";
import { AppraisalCycle } from "@/types/performance/appraisal.type";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import Link from "next/link";

export default function AppraisalCycleList({
  cycles,
}: {
  cycles: AppraisalCycle[];
}) {
  const [editing, setEditing] = useState<AppraisalCycle | null>(null);

  const columns: ColumnDef<AppraisalCycle>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Appraisal Cycle Name",
        cell: ({ row }) => (
          <p className="font-semibold py-3">{row?.original?.name}</p>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) =>
          row?.original?.startDate
            ? format(new Date(row?.original?.startDate), "dd MMM yyyy")
            : "Not Started",
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => (
          <div>
            {row?.original?.endDate
              ? format(new Date(row?.original?.endDate), "dd MMM yyyy")
              : "Ongoing"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          return (
            <span className="capitalize">
              <StatusBadge status={row?.original?.status} />
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-left">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Button
              size="sm"
              variant="link"
              onClick={() => setEditing(row?.original)}
            >
              <FaEdit className="mr-1" />
            </Button>
            <DeleteIconDialog
              itemId={row?.original?.id}
              type="appraisal-cycle"
            />
          </div>
        ),
      },
      {
        id: "view",
        cell: ({ row }) => (
          <Link href={`/dashboard/performance/appraisals/${row?.original?.id}`}>
            <Button variant={"link"}>View Details</Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable columns={columns} data={cycles} />

      {editing && (
        <AppraisalCycleModal
          open={!!editing}
          setOpen={() => setEditing(null)}
          initialData={editing}
        />
      )}
    </>
  );
}
