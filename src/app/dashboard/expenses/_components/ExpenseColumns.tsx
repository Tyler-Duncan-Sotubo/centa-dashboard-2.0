// components/expense/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatars } from "@/components/avatars";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { ExpenseModal } from "./ExpenseModal";
import { ChevronUpDown } from "@/components/ui/chevron-up-down";
import { ExpenseApprovalSheet } from "./ExpenseApprovalSheet";

export type Expense = {
  id: string;
  requester: string;
  date: string;
  category: string;
  purpose: string;
  amount: string;
  status: "requested" | "pending" | "paid" | "rejected";
  submittedAt?: string;
  approvedBy?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  employeeId: string;
};

export const ExpenseColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: "requester",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Requester <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {Avatars({ name: row.original.requester })}
        <div className="text-sm text-gray-600">{row.original.requester}</div>
      </div>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Submitted At <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.submittedAt
        ? format(new Date(row.original.submittedAt), "MMM dd, yyyy")
        : "—",
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
    cell: ({ row }) => <div>{formatCurrency(Number(row.original.amount))}</div>,
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) =>
      row.original.paymentMethod ? <p>{row.original.paymentMethod}</p> : "—",
  },
  {
    accessorKey: "approvedBy",
    header: "Approved By",
    cell: ({ row }) => row.original.approvedBy || "—",
  },
  {
    accessorKey: "receiptUrl",
    header: "Receipt",
    cell: ({ row }) =>
      row.original.receiptUrl ? (
        <a
          href={row.original.receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="sm" className="px-2">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const statusVariantMap: Record<
        Expense["status"],
        "pending" | "ongoing" | "paid" | "rejected"
      > = {
        requested: "pending",
        pending: "ongoing",
        paid: "paid",
        rejected: "rejected",
      };

      return status === "requested" ? (
        <ExpenseApprovalSheet expenseId={row.original.id} />
      ) : (
        <Badge variant={statusVariantMap[status]}>{status}</Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center flex items-center justify-center gap-2">
        <ExpenseModal
          initialData={row.original}
          id={row.original.id}
          isEditing
        />
        <DeleteIconDialog itemId={row.original.id} type="expenses" />
      </div>
    ),
  },
];
