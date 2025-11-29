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
import { Department } from "@/types/employees.type";
import DataTableRowActions from "./DataTableRowActions";
import Image from "next/image";
import { Avatars } from "@/components/avatars";
import Link from "next/link";

export const columns: ColumnDef<Department>[] = [
  {
    id: "custom_department_id",
    header: "Department ID",
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `D${index.toString().padStart(4, "0")}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    id: "head",
    header: "Head Of Department",
    cell: ({ row }) => {
      const head = row.original.head;
      return head ? (
        <div className="flex items-center gap-2">
          {head.avatarUrl && (
            <Image
              src={head.avatarUrl}
              alt={head.name}
              width={32}
              height={32}
              className="rounded-full object-cover border"
            />
          )}
          <span className="capitalize font-medium">{head.name}</span>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    id: "members",
    header: "Members",
    cell: ({ row }) => {
      const employees = row.original.employees || [];
      if (!employees.length) {
        return <span className="text-gray-400">—</span>;
      }
      return (
        <div className="flex -space-x-5">
          {employees.slice(0, 5).map((emp, idx) => (
            <Link
              key={emp.id}
              href={`/dashboard/employees/${emp.id}`}
              className="avatar-stack-link inline-block border-2 border-white rounded-full bg-gray-100 transition-transform hover:-translate-y-1 focus:outline-none"
              style={{ zIndex: 10 - idx }}
              title={emp.name}
            >
              {emp.avatarUrl ? (
                <Image
                  src={emp.avatarUrl}
                  alt={emp.name}
                  width={48}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ display: "block" }}
                />
              ) : (
                <Avatars name={emp.name} />
              )}
            </Link>
          ))}
          {employees.length > 5 && (
            <span className="ml-2 text-xs text-gray-600">
              +{employees.length - 5}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ChevronUpDown />
      </Button>
    ),
    accessorFn: (row: Department) => row.createdAt,
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      const date = raw ? new Date(raw) : null;
      if (!date || isNaN(date.getTime())) return <div>—</div>;
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
        basePath="departments"
        getId={(data) => data.id}
        getName={(data) => data.name}
      />
    ),
  },
];

export function DepartmentsTable({
  data = [],
}: {
  data: Department[] | undefined;
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
          placeholder="Filter department..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table className="font-medium text-md">
          <TableHeader className="bg-monzo-background hover:bg-monzo-background/90">
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
