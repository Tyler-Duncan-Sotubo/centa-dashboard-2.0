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
import { Checkbox } from "@/shared/ui/checkbox";
import { SlSocialDropbox } from "react-icons/sl";
import { FaSearch } from "react-icons/fa";

export type DataTableMobileRowProps<TData> = {
  row: Row<TData>;
  table: TableType<TData>;
  onRowClick?: (row: TData) => void;
};

export type DataTableSelectionAction<TData> = {
  label: string;
  onClick: (args: {
    selectedRows: Row<TData>[];
    selectedData: TData[];
    table: TableType<TData>;
    clearSelection: () => void;
  }) => void | Promise<void>;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: (args: {
    selectedRows: Row<TData>[];
    selectedData: TData[];
  }) => boolean;
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

  /** ✅ selection */
  enableSelection?: boolean; // default false
  selectionActions?: DataTableSelectionAction<TData>[]; // actions shown when any selected

  /** ✅ default sorting (applied once on mount) */
  defaultSorting?: SortingState;
}

export function DataTable<TData, TValue>({
  columns,
  data,

  filterKey,
  filterPlaceholder,

  toolbarRight,
  toolbarLeft,

  defaultPageSize = 50,
  pageSizeOptions = [50, 100, 150, 200],
  allowCustomPageSize = false,

  onRowClick,

  disableRowSelection = false,

  mobileRow: MobileRow,
  hideTableOnMobile = false,

  showSearch = true,

  enableSelection = false,
  selectionActions = [],

  defaultSorting = [],
}: DataTableProps<TData, TValue>) {
  // ✅ apply defaultSorting ONCE (no useEffect to avoid infinite loops)
  const initialSortingRef = React.useRef<SortingState>(defaultSorting);
  const [sorting, setSorting] = React.useState<SortingState>(
    initialSortingRef.current,
  );

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

  const selectionColumn = React.useMemo<ColumnDef<TData, TValue>>(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-10 text-center" } as any,
    }),
    [],
  );

  const finalColumns = React.useMemo(() => {
    if (!enableSelection || disableRowSelection) return columns;
    return [selectionColumn, ...columns];
  }, [columns, enableSelection, disableRowSelection, selectionColumn]);

  const table = useReactTable({
    data: data ?? [],
    columns: finalColumns,

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

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedData = selectedRows.map((r) => r.original);
  const hasSelection =
    enableSelection && !disableRowSelection && selectedRows.length > 0;

  const clearSelection = () => table.resetRowSelection();

  return (
    <div className="w-full mt-5">
      {(filterKey && showSearch) ||
      toolbarLeft ||
      toolbarRight ||
      hasSelection ? (
        <div className="flex w-full flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {toolbarLeft}

            {hasSelection && selectionActions.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>

                {selectionActions.map((a) => {
                  const isDisabled =
                    a.disabled?.({ selectedRows, selectedData }) ?? false;

                  return (
                    <Button
                      key={a.label}
                      variant={a.variant ?? "outline"}
                      size={a.size ?? "sm"}
                      disabled={isDisabled}
                      onClick={() =>
                        a.onClick({
                          selectedRows,
                          selectedData,
                          table,
                          clearSelection,
                        })
                      }
                    >
                      {a.label}
                    </Button>
                  );
                })}

                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            ) : null}
          </div>

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

        <div
          className={hideTableOnMobile || MobileRow ? "hidden sm:block" : ""}
        >
          <Table>
            <TableHeader className="text-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        (header.column.columnDef.meta as any)?.className
                      }
                    >
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
                      <TableCell
                        key={cell.id}
                        className={`font-medium ${
                          cell.column.id === "status" ? "p-0" : "py-1.5"
                        } ${(cell.column.columnDef.meta as any)?.className ?? ""}`}
                      >
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
                        ) : cell.column.id === "select" ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="flex justify-center"
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
                    colSpan={finalColumns.length}
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
