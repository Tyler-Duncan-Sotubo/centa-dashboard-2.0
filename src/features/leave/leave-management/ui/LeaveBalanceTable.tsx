"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/shared/ui/loading";
import { LeaveBalance, LeaveSummary } from "../../types/leave.type";
import { DataTable } from "@/shared/ui/data-table";

/* ------------------ Right Sheet Cards ------------------ */

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

/* ------------------ Columns ------------------ */

export const leaveBalanceColumns: ColumnDef<LeaveSummary>[] = [
  {
    id: "custom_department_id",
    header: () => <span>#</span>,
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `${index.toString().padStart(2)}`;
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
      <div className="capitalize">{row.getValue("department") as string}</div>
    ),
  },
  {
    accessorKey: "jobRole",
    header: "Job Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("jobRole") as string}</div>
    ),
  },
  {
    accessorKey: "totalBalance",
    header: () => <div className="text-right">Total Balance</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue("totalBalance") as string}
      </div>
    ),
  },
];

/* ------------------ Main Component ------------------ */

export function LeaveBalanceTable({
  data,
}: {
  data: LeaveSummary[] | undefined;
}) {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<LeaveSummary | null>(null);

  const fetchLeaveTypes = async (employeeId: string) => {
    try {
      const res = await axios.get(`/api/leave-balance/employee/${employeeId}`);
      return res.data.data as LeaveBalance[];
    } catch (err) {
      if (isAxiosError(err) && err.response) return [];
      throw err;
    }
  };

  const balanceQuery = useQuery<LeaveBalance[]>({
    queryKey: ["leave-balance", selectedEmployee?.employeeId],
    enabled: Boolean(session?.backendTokens?.accessToken) && !!selectedEmployee,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!selectedEmployee?.employeeId) return [];
      return fetchLeaveTypes(selectedEmployee.employeeId);
    },
  });

  if (status === "loading") return <Loading />;

  return (
    <div className="w-full">
      <DataTable
        columns={leaveBalanceColumns}
        data={data ?? []}
        filterKey="name"
        filterPlaceholder="Filter name..."
        onRowClick={(row) => setSelectedEmployee(row as LeaveSummary)}
        disableRowSelection={false}
      />

      <Sheet
        open={!!selectedEmployee}
        onOpenChange={(open) => {
          if (!open) setSelectedEmployee(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-125 bg-white">
          <SheetHeader>
            <SheetTitle>Leave Details</SheetTitle>
          </SheetHeader>

          {balanceQuery.isLoading ? (
            <div className="py-6">
              <Loading />
            </div>
          ) : balanceQuery.isError ? (
            <div className="py-6">
              <p className="text-sm text-muted-foreground">
                Failed to load leave balances.
              </p>
            </div>
          ) : (
            <LeaveBalanceCards balances={balanceQuery.data ?? []} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
