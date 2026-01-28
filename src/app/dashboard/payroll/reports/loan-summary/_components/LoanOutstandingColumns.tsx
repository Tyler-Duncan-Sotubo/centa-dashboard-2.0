"use client";

import { Avatars } from "@/shared/ui/avatars";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";

interface LoanOutstandingRow {
  employeeId: string;
  employeeName: string;
  totalLoanAmount: string;
  totalRepaid: string;
  outstanding: string;
  status: string;
}

export const LoanOutstandingColumns: ColumnDef<LoanOutstandingRow>[] = [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {Avatars({
            name: row.original.employeeName,
          })}
          <div className="capitalize font-semibold">
            {row.original.employeeName}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalLoanAmount",
    header: "Total Loan",
    cell: ({ row }) => formatCurrency(Number(row.original.totalLoanAmount)),
  },
  {
    accessorKey: "totalRepaid",
    header: "Repaid",
    cell: ({ row }) => formatCurrency(Number(row.original.totalRepaid)),
  },
  {
    accessorKey: "outstanding",
    header: "Outstanding",
    cell: ({ row }) => formatCurrency(Number(row.original.outstanding)),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "pending" ? "pending" : "approved"}
      >
        {row.original.status}
      </Badge>
    ),
  },
];
