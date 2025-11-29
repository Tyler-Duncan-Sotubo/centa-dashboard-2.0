"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { DataTable } from "@/components/DataTable"; // ⬅️ adjust path if needed

type YtdEmployee = {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  gross_salary_ytd: number;
  net_salary_ytd: number;
  paye_tax_ytd: number;
  pension_contribution_ytd: number;
  employer_pension_contribution_ytd: number;
  nhf_contribution_ytd: number;
};

export const ytdColumns: ColumnDef<YtdEmployee>[] = [
  {
    id: "rowIndex",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "employeeNumber",
    header: "Employee #",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("employeeNumber")}</div>
    ),
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const first = row.original.firstName;
      const last = row.original.lastName;
      return <div>{`${first} ${last}`}</div>;
    },
  },
  {
    accessorKey: "gross_salary_ytd",
    header: "Gross YTD",
    cell: ({ row }) => (
      <div>{formatCurrency(row.getValue("gross_salary_ytd"))}</div>
    ),
  },
  {
    accessorKey: "net_salary_ytd",
    header: "Net YTD",
    cell: ({ row }) => (
      <div>{formatCurrency(row.getValue("net_salary_ytd"))}</div>
    ),
  },
  {
    accessorKey: "paye_tax_ytd",
    header: "PAYE YTD",
    cell: ({ row }) => (
      <div>{formatCurrency(row.getValue("paye_tax_ytd"))}</div>
    ),
  },
  {
    accessorKey: "pension_contribution_ytd",
    header: "Pension (Emp)",
    cell: ({ row }) => (
      <div>{formatCurrency(row.getValue("pension_contribution_ytd"))}</div>
    ),
  },
  {
    accessorKey: "employer_pension_contribution_ytd",
    header: "Pension (Er)",
    cell: ({ row }) => (
      <div>
        {formatCurrency(row.getValue("employer_pension_contribution_ytd"))}
      </div>
    ),
  },
  {
    accessorKey: "nhf_contribution_ytd",
    header: "NHF YTD",
    cell: ({ row }) => (
      <div>{formatCurrency(row.getValue("nhf_contribution_ytd"))}</div>
    ),
  },
];

export function YtdEmployeeTable({ data = [] }: { data: YtdEmployee[] }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between items-end">
        <div>
          <h3 className="text-xl my-1 font-semibold">YTD Employee Report</h3>
          <p className="text-gray-500 text-sm">
            Year-to-date payroll totals for each employee
          </p>
        </div>
      </div>

      <DataTable<YtdEmployee, unknown> columns={ytdColumns} data={data} />
    </div>
  );
}
