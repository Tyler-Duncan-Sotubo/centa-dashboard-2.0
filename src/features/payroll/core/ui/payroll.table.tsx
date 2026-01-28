"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { EmployeePayroll } from "@/types/employees.type";
import { formatCurrency } from "@/shared/utils/formatCurrency";

// Build dynamic allowance columns from the dataset
const getAllowanceColumns = (
  data: EmployeePayroll[],
): ColumnDef<EmployeePayroll>[] => {
  const allowanceTypes = new Set<string>();

  data.forEach((row) => {
    row.allowances?.forEach((allowance) => {
      allowanceTypes.add(allowance.type);
    });
  });

  return Array.from(allowanceTypes).map((type) => ({
    id: `allowance_${type.toLowerCase()}`, // use id (safer than accessorKey for dynamic)
    header: () => <div className="text-right">{type}</div>,
    cell: ({ row }) => {
      const allowance = row.original.allowances?.find((a) => a.type === type);
      return (
        <div className="text-right">
          {formatCurrency(allowance?.amount ?? 0)}
        </div>
      );
    },
  }));
};

export function PayrollTable({ data }: { data: EmployeePayroll[] }) {
  const columns = React.useMemo<ColumnDef<EmployeePayroll>[]>(() => {
    return [
      {
        accessorKey: "employee_number",
        header: "Employee ID",
        cell: ({ row }) => (
          <div className="capitalize min-w-24">
            {row.getValue("employee_number")}
          </div>
        ),
      },
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
        cell: ({ row }) => (
          <div className="capitalize min-w-40">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "basic",
        header: () => <div className="text-right">Basic</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.getValue("basic"))}
          </div>
        ),
      },
      {
        accessorKey: "housing",
        header: () => <div className="text-right">Housing</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.getValue("housing"))}
          </div>
        ),
      },
      {
        accessorKey: "transport",
        header: () => <div className="text-right">Transport</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.getValue("transport"))}
          </div>
        ),
      },

      // Dynamic allowance columns
      ...getAllowanceColumns(data),

      {
        accessorKey: "PAYE",
        header: () => <div className="text-right">PAYE</div>,
        cell: ({ row }) => (
          <div className="text-right font-bold text-error">
            {formatCurrency(row.getValue("PAYE"))}
          </div>
        ),
      },
      {
        accessorKey: "pension",
        header: () => <div className="text-right">Pension</div>,
        cell: ({ row }) => (
          <div className="text-right font-bold text-error">
            {formatCurrency(row.getValue("pension"))}
          </div>
        ),
      },
      {
        accessorKey: "NHF",
        header: () => <div className="text-right">NHF</div>,
        cell: ({ row }) => (
          <div className="text-right font-bold text-error">
            {formatCurrency(row.getValue("NHF"))}
          </div>
        ),
      },
      {
        accessorKey: "additionalDeductions",
        header: () => <div className="text-right">Additional Deductions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.getValue("additionalDeductions"))}
          </div>
        ),
      },
      {
        accessorKey: "bonus",
        header: () => <div className="text-right">Bonus</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.getValue("bonus"))}
          </div>
        ),
      },
      {
        accessorKey: "grossSalary",
        header: () => <div className="text-right">Monthly Gross</div>,
        cell: ({ row }) => (
          <div className="text-center font-bold text-brand">
            {formatCurrency(row.getValue("grossSalary"))}
          </div>
        ),
      },
      {
        accessorKey: "netSalary",
        header: () => <div className="text-center">Net Salary</div>,
        cell: ({ row }) => (
          <div className="text-center font-bold text-success p-2 rounded-xl">
            {formatCurrency(row.getValue("netSalary"))}
          </div>
        ),
      },
    ];
  }, [data]);

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      filterKey="name"
      filterPlaceholder="Filter name"
    />
  );
}
