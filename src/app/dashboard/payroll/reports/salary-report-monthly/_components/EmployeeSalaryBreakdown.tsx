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
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Badge } from "@/shared/ui/badge";
import { EmployeeDetail } from "@/types/payRunDetails";

export const columns: ColumnDef<EmployeeDetail>[] = [
  {
    id: "custom_department_id",
    header: "#",
    cell: ({ row }) => {
      const index = row.index + 1; // Ensure it starts from 1
      const formattedId = `${index.toString().padStart(1, "0")}`; // D0001, D0002...
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "employeeName",
    header: ({ column }) => {
      return (
        <div className="flex  w-full">
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee Name
            <ChevronUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("employeeName")}</div>
    ),
  },
  {
    accessorKey: "grossSalary",
    header: "Gross Salary",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("grossSalary"))}</div>,
  },
  {
    accessorKey: "netSalary",
    header: "Net Salary",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("netSalary"))}</div>,
  },
  {
    accessorKey: "deductions",
    header: "Deductions",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("deductions"))}</div>,
  },
  {
    accessorKey: "bonuses",
    header: "Bonuses",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("bonuses"))}</div>,
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

export function EmployeeSalaryBreakdown({
  data = [],
}: {
  data: EmployeeDetail[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Get the current month in "yyyy-MM" format
  const currentMonth = data.length
    ? format(data[0].payrollMonth, "yyyy-MM")
    : "";

  // Set default filter to the current month
  const [monthFilter, setMonthFilter] = React.useState(currentMonth);

  // Optimize dropdown options by caching unique months
  const availableMonths = React.useMemo(() => {
    const months = new Set(
      data.map((entry) => format(parseISO(entry.payrollMonth), "yyyy-MM")),
    );
    return Array.from(months);
  }, [data]);

  // Efficient filtering using useMemo
  const filteredData = React.useMemo(
    () =>
      data.filter(
        (entry) => format(entry.payrollMonth, "yyyy-MM") === monthFilter,
      ),
    [data, monthFilter],
  );

  const table = useReactTable({
    data: filteredData,
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
      <div className="mb-2">
        <h3 className="text-xl my-1 font-semibold">
          Employee Salary Breakdown
        </h3>
        <p className="text-gray-500 text-sm">
          View detailed breakdown of employee salaries for the selected month.
        </p>
      </div>
      <div className="flex items-center gap-4 py-4">
        {/* Search Input */}
        <Input
          placeholder="Search employee..."
          value={
            (table.getColumn("employeeName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("employeeName")?.setFilterValue(event.target.value)
          }
          className="w-64"
        />

        {/* Month Filter Dropdown */}
        <Select onValueChange={setMonthFilter} value={monthFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {format(parseISO(month + "-01"), "MMMM yyyy")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table className="font-medium text-md">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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

      {/* Pagination & Selection Info */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
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
