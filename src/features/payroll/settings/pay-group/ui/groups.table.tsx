"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { DataTable } from "@/shared/ui/data-table";
import DataTableRowActions from "../../../../../shared/ui/data-table-row-actions";
import { EmployeeGroup } from "@/types/employees.type";

export const columns: ColumnDef<EmployeeGroup>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "payFrequency",
    header: () => <p>Pay Frequency</p>,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("payFrequency")}</div>
    ),
  },
  {
    accessorKey: "apply_paye",
    header: "PAYE",
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("apply_paye"));
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_pension",
    header: "Pension",
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("apply_pension"));
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_nhf",
    header: "NHF",
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("apply_nhf"));
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_additional",
    header: "Additional Deductions",
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("apply_additional"));
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
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
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
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
        basePath="groups"
        getId={(data) => data.id}
        getName={(data) => data.name}
      />
    ),
  },
];

export function EmployeeGroupsTable({
  data = [],
}: {
  data: EmployeeGroup[] | undefined;
}) {
  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      filterKey="name"
      filterPlaceholder="Filter groups..."
    />
  );
}
