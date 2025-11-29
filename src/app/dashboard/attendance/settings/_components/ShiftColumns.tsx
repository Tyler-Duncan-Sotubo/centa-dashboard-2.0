import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Shift } from "@/types/shift.type";
import { ShiftModal } from "./ShiftModal";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";

export const ShiftColumns: ColumnDef<Shift>[] = [
  {
    id: "custom_id",
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
      const index = row.index + 1;
      return <div className="capitalize">{index.toString().padStart(2)}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Shift Name",
    cell: ({ row }) => (
      <span className="font-medium capitalize">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => <span>{row.original.startTime}</span>,
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => <span>{row.original.endTime}</span>,
  },
  {
    accessorKey: "workingDays",
    header: "Working Days",
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">
        {row.original.workingDays?.join(", ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "lateToleranceMinutes",
    header: "Late Tolerance",
    cell: ({ row }) => (
      <span>{row.original.lateToleranceMinutes ?? 0} mins</span>
    ),
  },
  {
    accessorKey: "allowEarlyClockIn",
    header: "Early Clock-In",
    cell: ({ row }) =>
      row.original.allowEarlyClockIn
        ? `${row.original.earlyClockInMinutes || 0} mins`
        : "No",
  },
  {
    accessorKey: "allowLateClockOut",
    header: "Late Clock-Out",
    cell: ({ row }) =>
      row.original.allowLateClockOut
        ? `${row.original.lateClockOutMinutes || 0} mins`
        : "No",
  },
  {
    accessorKey: "locationName",
    header: "Location Name",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.locationName || "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center flex items-center justify-center gap-2">
        <ShiftModal isEditing initialData={row.original} id={row.original.id} />
        <DeleteIconDialog itemId={row.original.id} type="shifts" />
      </div>
    ),
  },
];
