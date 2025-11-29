"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export interface LeaveSummary {
  employeeId: string;
  name: string;
  department: string | null;
  jobRole: string | null;
  totalBalance: string;
}

interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitlement: string;
  used: string;
  balance: string;
}

export function LeaveBalanceCards({
  balances,
}: {
  balances: LeaveBalance[] | undefined;
}) {
  return (
    <div>
      {balances?.map((leave) => (
        <div key={leave.leaveTypeId} className="flex flex-col">
          <div className="mt-4 mb-2">
            <p>{leave.leaveTypeName}</p>
          </div>
          <div className="flex justify-between text-sm border p-4">
            <div>
              <p className="text-muted-foreground">Available</p>
              <p className="font-semibold text-green-600">
                {leave.balance} days
              </p>
            </div>
            <div className="border-l pl-2 w-1/2">
              <p className="text-muted-foreground">Used</p>
              <p className="font-semibold text-red-600">{leave.used} days</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const columns: ColumnDef<LeaveSummary>[] = [
  {
    id: "custom_department_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        #
      </Button>
    ),
    cell: ({ row }) => {
      const index = row.index + 1; // Ensure it starts from 1
      const formattedId = `${index.toString().padStart(2)}`; // D0001, D0002...
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
        Name <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-14 h-14">
            <AvatarFallback>
              <div className="bg-monzo-background w-20 h-20 text-white flex items-center justify-center font-bold">
                {initials}
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="capitalize font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "jobRole",
    header: "Job Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("jobRole")}</div>
    ),
  },
  {
    accessorKey: "totalBalance",
    header: () => <div className="text-right">Total Balance</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue("totalBalance")}
      </div>
    ),
  },
];

export function LeaveBalanceTable({
  data,
}: {
  data: LeaveSummary[] | undefined;
}) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [employeeBalanceData, setEmployeeBalanceData] =
    React.useState<LeaveBalance[]>();
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<LeaveSummary | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/leave-balance/employee/${selectedEmployee?.employeeId}`
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    isLoading,
    isError,
    data: balance,
  } = useQuery<LeaveBalance[]>({
    queryKey: ["leave-balance", selectedEmployee],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      return fetchLeaveTypes();
    },
    enabled: !!session?.backendTokens?.accessToken && !!selectedEmployee,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Update local state when `data` changes
  React.useEffect(() => {
    if (balance) {
      setEmployeeBalanceData(balance);
    }
  }, [balance]);

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

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
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
                  onClick={() => setSelectedEmployee(row.original)}
                  className="cursor-pointer hover:bg-muted"
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
                  className="text-center py-8"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} total record(s)
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

      <Sheet
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
      >
        <SheetContent className="w-full sm:max-w-[500px] bg-white">
          <SheetHeader>
            <SheetTitle>Leave Details</SheetTitle>
          </SheetHeader>
          <LeaveBalanceCards balances={employeeBalanceData} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
