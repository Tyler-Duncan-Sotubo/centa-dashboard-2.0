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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeePayroll } from "@/types/employees.type";
import { formatCurrency } from "@/utils/formatCurrency";

const getAllowanceColumns = (data: EmployeePayroll[]) => {
  const allowanceTypes = new Set<string>();

  data.forEach((row) => {
    row.allowances?.forEach((allowance) => {
      allowanceTypes.add(allowance.type);
    });
  });

  return Array.from(allowanceTypes).map((type) => ({
    accessorKey: `allowance_${type.toLowerCase()}`,
    header: () => <div className="text-right">{type}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cell: ({ row }: { row: any }) => {
      const allowance = row.original.allowances?.find(
        (a: { type: string }) => a.type === type
      );
      return (
        <div className="text-right">
          {formatCurrency(allowance?.amount || 0)}
        </div>
      );
    },
  }));
};

export function PayrollTable({ data }: { data: EmployeePayroll[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(() => {
    const baseColumns: ColumnDef<EmployeePayroll>[] = [
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
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="px-0 hover:bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ChevronUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="capitalize  min-w-40">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "basic",
        header: () => <div className="text-right">Basic</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {formatCurrency(row.getValue("basic"))}
            </div>
          );
        },
      },
      {
        accessorKey: "housing",
        header: () => <div className="text-right">Housing</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {formatCurrency(row.getValue("housing"))}
            </div>
          );
        },
      },
      {
        accessorKey: "transport",
        header: () => <div className="text-right">Transport</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {formatCurrency(row.getValue("transport"))}
            </div>
          );
        },
      },
      ...getAllowanceColumns(data),
      {
        accessorKey: "PAYE",
        header: () => <div className="text-right">PAYE</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-bold text-error">
              {formatCurrency(row.getValue("PAYE"))}
            </div>
          );
        },
      },
      {
        accessorKey: "pension",
        header: () => <div className="text-right">Pension</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-bold text-error">
              {formatCurrency(row.getValue("pension"))}
            </div>
          );
        },
      },
      {
        accessorKey: "NHF",
        header: () => <div className="text-right">NHF</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-bold text-error">
              {formatCurrency(row.getValue("NHF"))}
            </div>
          );
        },
      },
      {
        accessorKey: "additionalDeductions",
        header: () => <div className="text-right">Additional Deductions</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {formatCurrency(row.getValue("additionalDeductions"))}
            </div>
          );
        },
      },
      {
        accessorKey: "bonus",
        header: () => <div className="text-right">Bonus</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {formatCurrency(row.getValue("bonus"))}
            </div>
          );
        },
      },
      {
        accessorKey: "grossSalary",
        header: () => <div className="text-right">Monthly Gross</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center font-bold text-brand">
              {formatCurrency(row.getValue("grossSalary"))}
            </div>
          );
        },
      },
      {
        accessorKey: "netSalary",
        header: () => <div className="text-center ">Net Salary</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center font-bold text-success p-2 rounded-xl">
              {formatCurrency(row.getValue("netSalary"))}
            </div>
          );
        },
      },
    ];
    return baseColumns;
  }, [data]);

  const table = useReactTable({
    data,
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
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
                    <TableCell key={cell.id} className="py-4">
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
                  className="h-24 text-center "
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
