"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

import { ChevronDown, Trash2, Users, Settings2 } from "lucide-react";

import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import EmptyState from "@/shared/ui/empty-state";
import EmployeeGroupFormSheet from "./EmployeeGroupFormSheet";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { GroupType } from "@/types/team.type";
import { HiOutlineUserGroup } from "react-icons/hi2";

// --- Types ---
export type EmployeeGroup = {
  id: string;
  name: string;
  type: GroupType | undefined;
  parentGroupId: string | null;
  createdAt: string;
  members: number;
  leadEmployeeId: string | null;
  leadEmployeeName: string | null;
  employeeIds: string[];
};

// --- Data Fetch ---
async function fetchEmployeeGroups(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axiosInstance: any,
): Promise<EmployeeGroup[]> {
  try {
    const res = await axiosInstance.get("/api/employee-groups");
    return res.data?.data ?? [];
  } catch (error) {
    if (isAxiosError(error) && error.response) return [];
    throw error;
  }
}

// --- Row Actions (Delete) ---
function DeleteAlert({ id }: { id: string }) {
  const deleteGroup = useDeleteMutation({
    endpoint: `/api/employee-groups/${id}`,
    successMessage: "Group deleted successfully",
    refetchKey: "employee-groups",
  });

  const handleDelete = async () => {
    try {
      await deleteGroup();
    } catch (e) {
      console.error("Error deleting group:", e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-monzo-error" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete group?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and will remove the group and its
            memberships.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- DataTable Toolbar ---
function DataTableToolbar({
  table,
}: {
  table: ReturnType<typeof useReactTable<EmployeeGroup>>;
}) {
  const typeColumn = table.getColumn("type");

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search group or lead…"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            table.getColumn("name")?.setFilterValue(val);
            table.getColumn("leadEmployeeName")?.setFilterValue(val);
          }}
          className="w-60"
        />
        {typeColumn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Type
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["TEAM", "PROJECT", "INTEREST", "SECURITY"].map((t) => (
                <DropdownMenuCheckboxItem
                  key={t}
                  checked={
                    Array.isArray(typeColumn.getFilterValue())
                      ? (typeColumn.getFilterValue() as string[]).includes(t)
                      : false
                  }
                  onCheckedChange={(checked) => {
                    const current =
                      (typeColumn.getFilterValue() as string[]) ?? [];
                    typeColumn.setFilterValue(
                      checked
                        ? [...current, t]
                        : current.filter((x) => x !== t),
                    );
                  }}
                >
                  {t}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Columns
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// --- Columns ---
function useColumns() {
  return useMemo<ColumnDef<EmployeeGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Group",
        cell: ({ row }) => {
          const g = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium py-3">{g.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "leadEmployeeName",
        header: "Lead",
        cell: ({ row }) => {
          const lead = row.original.leadEmployeeName;
          return (
            <span className={lead ? "" : "text-muted-foreground"}>
              {lead ?? "—"}
            </span>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: "members",
        header: () => (
          <div className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" />
            Members
          </div>
        ),
        cell: ({ row }) => <span>{row.original.members}</span>,
        enableHiding: true,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.type?.toLowerCase()}
          </Badge>
        ),
        // For multi-select filtering (toolbar)
        filterFn: (row, id, filterValues) => {
          if (
            !filterValues ||
            (Array.isArray(filterValues) && filterValues.length === 0)
          )
            return true;
          const v = row.getValue<string>(id);
          return (filterValues as string[]).includes(v);
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
        enableHiding: true,
        sortingFn: "datetime",
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const g = row.original;
          return (
            <div className="flex items-center justify-center">
              <EmployeeGroupFormSheet isEditing selected={row.original} />
              <DeleteAlert id={g.id} />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );
}

// --- Main Component ---
export default function EmployeeGroupDataTable() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const { data, isLoading, isError } = useQuery<EmployeeGroup[]>({
    queryKey: ["employee-groups"],
    queryFn: () => fetchEmployeeGroups(axiosInstance),
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  const columns = useColumns();

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage your teams and their members."
      >
        <EmployeeGroupFormSheet />
      </PageHeader>

      {(data?.length ?? 0) === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Employee Groups Found"
            description="You don’t have any employee groups yet. Once groups are created, they’ll appear here."
            icon={<HiOutlineUserGroup />}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <DataTableToolbar table={table} />

          <div className="rounded-2xl border">
            <Table className="text-sm">
              <TableHeader className="bg-monzo-background ">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-monzo-textPrimary py-3"
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
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
            <div className="flex items-center gap-2">
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
