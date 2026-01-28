import { ColumnDef } from "@tanstack/react-table";
import { HolidayModal } from "./HolidayModal";
import { Button } from "@/shared/ui/button";
import { Holiday } from "@/types/holiday.type"; // Replace with correct type path
import { format } from "date-fns";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";

export const HolidayColumns: ColumnDef<Holiday>[] = [
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
      const formattedId = `${index.toString().padStart(2, "0")}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Holiday Name",
    cell: ({ row }) => (
      <span className="capitalize font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span>{new Date(row.original.date).toDateString()}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => <span>{row.original.country || "—"}</span>,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.source}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span>{format(new Date(row.original.createdAt), "dd/MM/yyyy")}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <HolidayModal
          isEditing
          initialData={row.original}
          id={row.original.id}
        />
        <DeleteIconDialog itemId={row.original.id} type="holidays" />
      </div>
    ),
  },
];
