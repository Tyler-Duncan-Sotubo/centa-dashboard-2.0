import { Button } from "@/shared/ui/button";
import { BlockedDay } from "@/types/blockedDays.type";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { BlockedDaysModal } from "./BlockedDaysModal";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hr_manager: "HR Manager",
  hr_assistant: "HR Assistant",
  recruiter: "Recruiter",
  payroll_specialist: "Payroll Specialist",
  benefits_admin: "Benefits Admin",
  finance_manager: "Finance Manager",
  employee: "Employee",
  manager: "Manager",
};

export const BlockedDaysColumns: ColumnDef<BlockedDay>[] = [
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
      const index = row.index + 1; // Ensure it starts from 1
      const formattedId = `${index.toString().padStart(2)}`; // D0001, D0002...
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name || "—"}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Blocked Date",
    cell: ({ row }) => (
      <span className="font-medium">
        {format(new Date(row.original.date), "MMMM do, yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.createdBy
          ? roleLabels[row.original.createdBy] || row.original.createdBy
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.reason || "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(new Date(row.original.createdAt), "MMMM do, yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <BlockedDaysModal
          isEditing
          initialData={row.original}
          id={row.original.id}
        />
        <DeleteIconDialog itemId={row.original.id} type="blocked-days" />
      </div>
    ),
  },
];
