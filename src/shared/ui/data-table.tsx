"use client";

import * as React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Row,
  Table as TableType,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SlSocialDropbox } from "react-icons/sl";
import { FaSearch } from "react-icons/fa";

export type DataTableMobileRowProps<TData> = {
  row: Row<TData>;
  table: TableType<TData>;
  onRowClick?: (row: TData) => void;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;

  filterKey?: string;
  filterPlaceholder?: string;

  /** toolbar */
  toolbarRight?: React.ReactNode;
  toolbarLeft?: React.ReactNode;

  /** paging */
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  allowCustomPageSize?: boolean;

  onRowClick?: (row: TData) => void;

  /** footer */
  disableRowSelection?: boolean;

  /** ✅ mobile renderer */
  mobileRow?: React.ComponentType<DataTableMobileRowProps<TData>>;
  hideTableOnMobile?: boolean;

  /** optional */
  showSearch?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,

  filterKey,
  filterPlaceholder,

  toolbarRight,
  toolbarLeft,

  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  allowCustomPageSize = false,

  onRowClick,

  disableRowSelection = false,

  mobileRow: MobileRow,
  hideTableOnMobile = false,

  showSearch = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [customOpen, setCustomOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState<string>("");

  const table = useReactTable({
    data: data ?? [],
    columns,

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const pageSize = table.getState().pagination.pageSize;
  const rows = table.getRowModel().rows;

  const applyCustomPageSize = (value: string) => {
    setCustomValue(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) table.setPageSize(n);
  };

  return (
    <div className="w-full mt-5">
      {/* Toolbar + optional filter */}
      {(filterKey && showSearch) || toolbarLeft || toolbarRight ? (
        <div className="flex w-full flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">{toolbarLeft}</div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            {filterKey && showSearch && (
              <Input
                placeholder={filterPlaceholder ?? "Filter..."}
                value={
                  (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(filterKey)?.setFilterValue(event.target.value)
                }
                className="w-full sm:w-72 placeholder:text-xs"
                leftIcon={<FaSearch size={15} />}
              />
            )}
            {toolbarRight}
          </div>
        </div>
      ) : null}

      <div className="rounded-md border">
        {/* ✅ Mobile cards */}
        {MobileRow ? (
          <div className="block sm:hidden">
            {rows.length ? (
              <div className="divide-y">
                {rows.map((row) => (
                  <MobileRow
                    key={row.id}
                    row={row}
                    table={table}
                    onRowClick={onRowClick}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <SlSocialDropbox size={56} />
                  <span className="text-sm">No record found</span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ✅ Desktop table (and optionally mobile too) */}
        <div
          className={hideTableOnMobile || MobileRow ? "hidden sm:block" : ""}
        >
          <Table>
            <TableHeader className="text-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="text-md">
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-muted/50 transition-colors"
                        : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 font-medium">
                        {cell.column.id === "actions" ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <SlSocialDropbox size={70} />
                      <span className="text-sm">No record found</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      {!disableRowSelection && (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} total record(s)
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>

              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={customOpen ? "custom" : String(pageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "custom") {
                    setCustomOpen(true);
                    setCustomValue(String(pageSize));
                  } else {
                    setCustomOpen(false);
                    setCustomValue("");
                    table.setPageSize(Number(v));
                  }
                }}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                {allowCustomPageSize && <option value="custom">Custom…</option>}
              </select>

              {allowCustomPageSize && customOpen && (
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="e.g. 25"
                  className="w-24"
                  value={customValue}
                  onChange={(e) => applyCustomPageSize(e.target.value)}
                />
              )}
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
      )}
    </div>
  );
}
