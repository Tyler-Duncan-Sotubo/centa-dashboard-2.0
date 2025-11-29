"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PaySchedule } from "@/types/pay-schedule";

export const columns = (
  selectedSchedule: PaySchedule | null,
  setSelectedSchedule: (schedule: PaySchedule | null) => void
): ColumnDef<PaySchedule>[] => [
  {
    id: "select",
    header: () => <div className="text-left">Select</div>,
    cell: ({ row }) => (
      <Checkbox
        checked={selectedSchedule?.id === row.original.id}
        onCheckedChange={() =>
          setSelectedSchedule(
            selectedSchedule?.id === row.original.id ? null : row.original
          )
        }
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "payFrequency",
    header: "Frequency",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("payFrequency")}</div>
    ),
  },
  {
    accessorKey: "holidayAdjustment",
    header: "Holiday Adjustment",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("holidayAdjustment")}</div>
    ),
  },
  {
    accessorKey: "weekendAdjustment",
    header: "Weekend Adjustment",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("weekendAdjustment")}</div>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Start Date
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("startDate")), "dd MMM yyyy")}</div>
    ),
  },
];

export function PayScheduleTable({
  data = [],
  selectedSchedule,
  setSelectedSchedule,
}: {
  data: PaySchedule[] | undefined;
  selectedSchedule: PaySchedule | null;
  setSelectedSchedule: (schedule: PaySchedule | null) => void;
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
    columns: columns(selectedSchedule, setSelectedSchedule),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
    <div className="w-full hidden md:block">
      {/* Table Container */}
      <div>
        <Table className="font-medium text-md">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
                <TableRow
                  key={row.id}
                  onClick={
                    () =>
                      setSelectedSchedule(
                        selectedSchedule?.id === row.original.id
                          ? null
                          : row.original
                      ) // ✅ Toggle selection
                  }
                  className={cn("cursor-pointer", {
                    "bg-blue-100": selectedSchedule?.id === row.original.id, // ✅ Highlight row when selected
                  })}
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
                  colSpan={
                    columns(selectedSchedule, setSelectedSchedule).length
                  }
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Selection Info */}
    </div>
  );
}
