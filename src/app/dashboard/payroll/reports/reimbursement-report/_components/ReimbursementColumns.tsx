"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Avatars } from "@/shared/ui/avatars";

export interface ReimbursementRow {
  id: string;
  date: string;
  submittedAt: string;
  category: string;
  purpose: string;
  amount: string;
  status: string;
  paymentMethod: string;
  requester: string;
  approvedBy: string;
  approvalDate: string | null;
}

export const ReimbursementColumns: ColumnDef<ReimbursementRow>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: "requester",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Requester <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {Avatars({
            name: row.original.requester,
          })}
          <div className="capitalize font-semibold">
            {row.original.requester}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(Number(row.original.amount)),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "paid"
            ? "approved"
            : row.original.status === "rejected"
              ? "rejected"
              : row.original.status === "pending"
                ? "pending"
                : "ongoing"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "approvedBy",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Approved By <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
];
