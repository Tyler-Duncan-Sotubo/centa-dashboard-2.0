"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import DataTableRowActions from "@/shared/ui/data-table-row-actions";
import { JobRole } from "../types/job-roles.type";

export const jobRolesColumns: ColumnDef<JobRole>[] = [
  {
    id: "custom_job_role_id",
    header: "Role ID",
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `JR${index.toString().padStart(4, "0")}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Level
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("level")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="first-letter:uppercase">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ChevronUpDown />
      </Button>
    ),
    accessorFn: (row: JobRole) => row.createdAt,
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      const date = raw ? new Date(raw) : null;
      if (!date || isNaN(date.getTime())) return <div>—</div>;
      return (
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        basePath="job-roles"
        getId={(data) => data.id}
        getName={(data) => data.title}
        getDescription={(data) => data.description}
        getLevel={(data) => data.level}
      />
    ),
  },
];
