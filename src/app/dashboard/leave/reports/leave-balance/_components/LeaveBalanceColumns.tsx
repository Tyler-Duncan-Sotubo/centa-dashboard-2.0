import { Avatars } from "@/components/avatars";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";

type LeaveBalance = {
  employeeName: string;
  leaveTypeName: string;
  year: number;
  entitlement: string;
  used: string;
  balance: string;
};

export const leaveBalanceColumns: ColumnDef<LeaveBalance>[] = [
  {
    accessorKey: "employeeName",
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
      return (
        <div className="flex items-center space-x-2">
          {Avatars({
            name: row.original.employeeName,
          })}
          <div className="capitalize font-semibold">
            {row.original.employeeName}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "leaveTypeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Leave Type <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Year <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "entitlement",
    header: "Entitlement",
  },
  {
    accessorKey: "used",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Used <ChevronsUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
];
