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
import PaystubDownload from "@/components/common/tables/PaystubDownload";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";
import { ReportDownloadModal } from "@/components/common/ReportDownloadModal";
import { DeductionType } from "@/types/deduction.type";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export function FinalPayRunTable({
  data,
}: {
  data: EmployeeDetail[];
  name?: string;
}) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchDeductionTypes = async () => {
    const res = await axiosInstance.get("/api/deductions/types");
    return res.data.data as DeductionType[];
  };

  const { data: deductionTypes, isLoading: isLoadingTypes } = useQuery<
    DeductionType[]
  >({
    queryKey: ["deductionTypes"],
    queryFn: fetchDeductionTypes,
    enabled: !!session?.backendTokens.accessToken,
  });

  const baseColumns: ColumnDef<EmployeeDetail>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee
          <ChevronUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "grossSalary",
      header: () => <div className="text-right">Gross Salary</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("grossSalary"))}
        </div>
      ),
    },
    {
      accessorKey: "payeTax",
      header: () => <div className="text-right">PAYE</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("payeTax"))}
        </div>
      ),
    },
    {
      accessorKey: "pensionContribution",
      header: () => <div className="text-right">Pension</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("pensionContribution"))}
        </div>
      ),
    },
    {
      accessorKey: "nhfContribution",
      header: () => <div className="text-right">NHF</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("nhfContribution"))}
        </div>
      ),
    },
    {
      accessorKey: "bonuses",
      header: () => <div className="text-right">Bonus</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("bonuses"))}
        </div>
      ),
    },
    {
      id: "reimbursements",
      header: () => <div className="text-right">Reimbursements</div>, // The header name
      cell: ({ row }) => {
        const reimbursements = row.original.reimbursements || [];

        // Calculate the total amount of all reimbursements using native JavaScript numbers
        const totalReimbursementAmount = reimbursements.reduce(
          (sum, reimbursement) => sum + (Number(reimbursement.amount) || 0),
          0
        );

        return (
          <div className="text-right font-medium">
            {formatCurrency(totalReimbursementAmount)}
          </div>
        );
      },
    },
  ];

  const netSalaryColumn: ColumnDef<EmployeeDetail> = {
    id: "netSalary",
    header: () => <div className="text-right">Net Salary</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-success">
        {formatCurrency(row.original.netSalary)}
      </div>
    ),
  };

  const payStubColumn: ColumnDef<EmployeeDetail> = {
    id: "Pay_Stub",
    enableHiding: false,
    header: () => <div className="text-center">Pay Stub</div>,
    cell: ({ row }) => (
      <PaystubDownload row={row} deductionTypes={deductionTypes ?? []} />
    ),
  };

  const voluntaryDeductionColumns: ColumnDef<EmployeeDetail>[] =
    deductionTypes?.map((type) => ({
      id: `voluntary-${type.id}`,
      header: () => <div className="text-right">{type.name}</div>,
      cell: ({ row }) => {
        const deductions = row.original.voluntaryDeductions || [];
        const deduction = deductions.find((d) => d.typeId === type.id);
        return (
          <div className="text-right font-medium">
            {formatCurrency(Number(deduction?.amount ?? 0))}
          </div>
        );
      },
    })) ?? [];

  const allColumns = React.useMemo(
    () => [
      ...baseColumns,
      ...voluntaryDeductionColumns,
      netSalaryColumn,
      payStubColumn,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deductionTypes]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: allColumns,
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

  if (isLoadingTypes) {
    return <div>Loading deduction types...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by employee name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <ReportDownloadModal
          id={data[0]?.payrollRunId}
          date={data[0]?.payrollDate}
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
                    <TableCell key={cell.id} className="py-2">
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
                  colSpan={baseColumns.length}
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
