"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";
import PayrollTableAction from "./PayrollTableAction";

function formatPayrollMonth(payrollMonth: string): string {
  if (!payrollMonth) return "";
  const [year, month] = payrollMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return `${date.toLocaleString("en-US", { month: "long" })} ${year}`;
}

export const columns: ColumnDef<EmployeeDetail>[] = [
  {
    accessorKey: "payrollMonth",
    header: "Payroll Month",
    cell: ({ row }) => (
      <div className="capitalize">
        {formatPayrollMonth(row.getValue("payrollMonth"))}
      </div>
    ),
  },
  {
    accessorKey: "payrollDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payroll Date
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("payrollDate")}</div>
    ),
  },
  {
    accessorKey: "totalPayrollCost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      const total = Number(row.getValue("totalPayrollCost") ?? 0);
      return (
        <div className="text-right font-medium">{formatCurrency(total)}</div>
      );
    },
  },
  {
    accessorKey: "totalGrossSalary",
    header: () => <div className="text-right">Total Gross</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("totalGrossSalary"))}
      </div>
    ),
  },
  {
    accessorKey: "totalDeductions",
    header: () => <div className="text-right">Total Deduction</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("totalDeductions"))}
      </div>
    ),
  },
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => (
      <div className="flex items-center justify-center w-full">
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Approval Status
          <ChevronUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("approvalStatus") as string;

      return (
        <div className="flex justify-center">
          <Badge
            variant={
              status === "completed"
                ? "approved"
                : status === "rejected"
                  ? "rejected"
                  : "pending"
            }
            className="capitalize"
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <div className="flex items-center justify-center w-full">
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Status
          <ChevronUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return (
        <div className="flex justify-center">
          <Badge
            variant={
              status === "approved"
                ? "approved"
                : status === "rejected"
                  ? "rejected"
                  : "pending"
            }
            className="capitalize"
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <PayrollTableAction
        row={row}
        basePath="payroll/approvals"
        getId={(d) => d.payrollRunId}
      />
    ),
  },
];

export function PayrollSchedule({
  data,
}: {
  data: EmployeeDetail[] | undefined;
}) {
  return <DataTable columns={columns} data={data ?? []} />;
}
