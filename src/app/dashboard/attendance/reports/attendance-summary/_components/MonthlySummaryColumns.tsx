import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MonthlySummary } from "@/types/attendance-reports.type";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const MonthlySummaryColumns: ColumnDef<MonthlySummary>[] = [
  {
    id: "index",
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
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "employee",
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
      const name = row.original.name as string;
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
          <div>
            <div className="capitalize font-semibold">{row.original.name}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "present",
    header: "Present",
    cell: ({ row }) => <span>{row.original.present}</span>,
  },
  {
    accessorKey: "late",
    header: "Late",
    cell: ({ row }) => <span>{row.original.late}</span>,
  },
  {
    accessorKey: "absent",
    header: "Absent",
    cell: ({ row }) => (
      <span
        className={
          row.original.absent > 15 ? "text-destructive font-semibold" : ""
        }
      >
        {row.original.absent}
      </span>
    ),
  },
  {
    accessorKey: "onLeave",
    header: "On Leave",
    cell: ({ row }) => <span>{row.original.onLeave}</span>,
  },
  {
    accessorKey: "holidays",
    header: "Holidays",
    cell: ({ row }) => <span>{row.original.holidays}</span>,
  },
  {
    accessorKey: "penalties",
    header: "Penalties",
    cell: ({ row }) => <span>{row.original.penalties}</span>,
  },
];
