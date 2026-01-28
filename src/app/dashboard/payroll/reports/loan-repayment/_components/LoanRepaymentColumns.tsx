import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatCurrency } from "@/shared/utils/formatCurrency"; // Assuming you have this utility

type LoanRepaymentSummary = {
  employeeId: string;
  employeeName: string;
  totalRepaid: string;
  repaymentCount: string;
  firstRepayment: string;
  lastRepayment: string;
};

export const LoanRepaymentColumns: ColumnDef<LoanRepaymentSummary>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee Name",
  },
  {
    accessorKey: "totalRepaid",
    header: "Total Repaid",
    cell: ({ row }) => formatCurrency(Number(row.original.totalRepaid)),
  },
  {
    accessorKey: "repaymentCount",
    header: "Repayment Count",
    cell: ({ row }) => Number(row.original.repaymentCount).toLocaleString(),
  },
  {
    accessorKey: "firstRepayment",
    header: "First Repayment",
    cell: ({ row }) =>
      row.original.firstRepayment
        ? format(new Date(row.original.firstRepayment), "dd MMM yyyy")
        : "-",
  },
  {
    accessorKey: "lastRepayment",
    header: "Last Repayment",
    cell: ({ row }) =>
      row.original.lastRepayment
        ? format(new Date(row.original.lastRepayment), "dd MMM yyyy")
        : "-",
  },
];
