"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUpDown } from "@/components/ui/chevron-up-down";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";

function formatPayrollMonth(payrollMonth: string): string {
  if (!payrollMonth) return "";
  const [year, month] = payrollMonth?.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1); // Month is 0-based in JS
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payroll Date
          <ChevronUpDown />
        </Button>
      );
    },
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
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("totalGrossSalary"))}
        </div>
      );
    },
  },

  {
    accessorKey: "totalDeductions",
    header: () => <div className="text-right">Total Deduction</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("totalDeductions"))}
        </div>
      );
    },
  },
  {
    accessorKey: "approvalStatus",
    header: ({ column }) => {
      return (
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
      );
    },
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
    header: ({ column }) => {
      return (
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
      );
    },
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
];

export function OffCycleDetailsTable({
  data,
}: {
  data: EmployeeDetail[] | undefined;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table className="font-medium text-md">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
