import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "@/components/common/tables/DataTableRowActions";
import { LeaveType } from "@/types/leave.type";
import LeaveTypeModal from "./LeaveTypeModal";

export const LeaveTypesColumns: ColumnDef<LeaveType>[] = [
  {
    accessorKey: "name",
    header: "Leave Type",
    cell: ({ row }) => (
      <div className="font-medium capitalize">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
    cell: ({ row }) => <p>{row.original.isPaid ? "Yes" : "No"}</p>,
  },
  {
    accessorKey: "colorTag",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: row.original.colorTag }}
        />
        <span>{row.original.colorTag}</span>
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-2">
          <LeaveTypeModal isEditing initialData={row.original} />
          <DataTableRowActions
            row={row}
            basePath="leave-types"
            getId={(data) => data?.id}
          />
        </div>
      );
    },
  },
];
