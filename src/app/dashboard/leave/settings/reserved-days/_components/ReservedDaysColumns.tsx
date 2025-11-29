import { ReservedDay } from "@/types/reservedDays.type";
import { ColumnDef } from "@tanstack/react-table";
import { ReservedDaysModal } from "./ReservedDaysModal";
import { Button } from "@/components/ui/button";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";

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

export const ReservedDaysColumns: ColumnDef<ReservedDay>[] = [
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
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => (
      <span className="capitalize font-medium">
        {row.original.employeeName}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Reserved Date",
    cell: ({ row }) => (
      <span>
        {new Date(row.original.startDate).toDateString()} -{" "}
        {new Date(row.original.endDate).toDateString()}
      </span>
    ),
  },
  {
    accessorKey: "leaveType",
    header: "Leave Type",
    cell: ({ row }) => <span>{row.original.leaveType || "—"}</span>,
  },
  {
    accessorKey: "createdBy",
    header: "Added By",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.createdBy
          ? roleLabels[row.original.createdBy] || row.original.createdBy
          : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <ReservedDaysModal isEditing initialData={row.original} />
        <DeleteIconDialog itemId={row.original.id} type="reserved-days" />
      </div>
    ),
  },
];
