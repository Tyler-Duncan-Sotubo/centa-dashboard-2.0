// reimbursementsColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { FaFileImage } from "react-icons/fa";
import { Badge } from "@/shared/ui/badge";
import { formatCurrency } from "@/shared/utils/formatCurrency";

export type Reimbursement = {
  id: string;
  purpose: string;
  category: string;
  amount: string;
  status: string;
  createdAt: string;
  receiptUrl?: string | null;
};

export const reimbursementsColumns: ColumnDef<Reimbursement>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy"),
  },
  { accessorKey: "purpose", header: "Purpose" },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category || "Other",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(parseFloat(row.original.amount || "0")),
    meta: { className: "text-right" },
  },
  {
    accessorKey: "receiptUrl",
    header: "Receipt",
    cell: ({ row }) =>
      row.original.receiptUrl ? (
        <Link
          href={row.original.receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex justify-center"
        >
          <FaFileImage />
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    meta: { className: "text-center" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          (["approved", "rejected", "paid", "pending"].includes(
            row.original.status,
          )
            ? row.original.status
            : "pending") as "approved" | "rejected" | "paid" | "pending"
        }
      >
        {row.original.status}
      </Badge>
    ),
    meta: { className: "text-center" },
  },
  {
    accessorKey: "id",
    header: "Actions",
    cell: ({ row }) => (
      <Link
        href={`/ess/reimbursements/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        View Details
      </Link>
    ),
    meta: { className: "text-center" },
  },
];
