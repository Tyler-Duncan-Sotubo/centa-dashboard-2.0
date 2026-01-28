"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import DataTableRowActions from "../../../../shared/ui/data-table-row-actions";

import { Employee } from "@/types/employees.type";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Avatars } from "@/shared/ui/avatars";

export const employeeColumns: ColumnDef<Employee | undefined>[] = [
  {
    id: "custom_id",
    header: () => <div>#</div>,
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `${index.toString().padStart(2)}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "employeeNumber",
    header: "Employee Number",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("employeeNumber")}</div>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee Name <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const firstName = row.original?.firstName as string;
      const lastName = row.original?.lastName as string;
      const name = `${firstName} ${lastName}`;

      return (
        <div className="flex items-center gap-2">
          {Avatars({ name })}
          <div>
            <Link
              href={`/dashboard/employees/${row.original?.id}`}
              className="capitalize cursor-pointer hover:underline text-brand"
            >
              {firstName} {lastName}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="first-letter:uppercase">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "jobRole",
    header: "Job Title",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("jobRole")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "annualGross",
    header: () => <div className="text-right">Salary</div>,
    cell: ({ row }) => {
      const salary = Number(row.getValue("annualGross"));
      return (
        <div className="text-right font-medium">
          {formatCurrency(salary / 12)}
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
        basePath="employees"
        getId={(d) => d?.id}
      />
    ),
  },
];

export function EmployeesTable({ data }: { data: Employee[] | undefined }) {
  return (
    <DataTable
      columns={employeeColumns}
      data={data ?? []}
      // If your DataTable supports search, this gives you the same “Filter name” behavior.
      filterKey="firstName"
      filterPlaceholder="Filter name."
    />
  );
}
