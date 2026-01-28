import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Loan } from "@/types/loans.type";

const settledColumns: ColumnDef<Loan>[] = [
  { accessorKey: "loanNumber", header: "Loan No." },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(Number(row.original.amount)),
    meta: { className: "text-right" },
  },
  {
    accessorKey: "totalPaid",
    header: "Repaid",
    cell: ({ row }) => formatCurrency(Number(row.original.totalPaid)),
    meta: { className: "text-right" },
  },
  {
    accessorKey: "createAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
    meta: { className: "text-center" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => <Badge variant="approved">PAID</Badge>,
    meta: { className: "text-center" },
  },
];

export function SettledLoansTable({ data }: { data: Loan[] }) {
  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold">Settled Loans</h3>
      <DataTable columns={settledColumns} data={data} />
    </div>
  );
}
