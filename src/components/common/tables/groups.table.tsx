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
import { EmployeeGroup } from "@/types/employees.type";
import DataTableRowActions from "./DataTableRowActions";

export const columns: ColumnDef<EmployeeGroup>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ChevronUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "payFrequency",
    header: () => {
      return <p> Pay Frequency</p>;
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("payFrequency")}</div>
    ),
  },
  {
    accessorKey: "apply_paye",
    header: "PAYE",
    cell: ({ row }) => {
      const isActive = row.getValue("apply_paye");
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_pension",
    header: "Pension",
    cell: ({ row }) => {
      const isActive = row.getValue("apply_pension");
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_nhf",
    header: "NHF",
    cell: ({ row }) => {
      const isActive = row.getValue("apply_nhf");
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "apply_additional",
    header: "Additional Deductions",
    cell: ({ row }) => {
      const isActive = row.getValue("apply_additional");
      const status = isActive ? "Active" : "Inactive";

      const statusColors: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-3 py-1 font-semibold rounded-md ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ChevronUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        basePath="groups"
        getId={(data) => data.id}
        getName={(data) => data.name}
      />
    ),
  },
];

export function EmployeeGroupsTable({
  data = [],
}: {
  data: EmployeeGroup[] | undefined;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
          placeholder="Filter groups..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div>
        <Table className="font-medium text-md">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id}>
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
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
