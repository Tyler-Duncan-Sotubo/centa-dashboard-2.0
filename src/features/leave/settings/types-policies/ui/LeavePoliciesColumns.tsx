import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "@/shared/ui/data-table-row-actions";
import { LeavePolicy } from "@/features/leave/types/leave.type";
import { LeavePolicyModal } from "./LeavePolicyModal";

export const LeavePoliciesColumns: ColumnDef<LeavePolicy>[] = [
  {
    accessorKey: "leaveTypeName",
    header: "Leave Type",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.original.leaveTypeName}</div>
    ),
  },
  {
    accessorKey: "accrualEnabled",
    header: "Accrual",
    cell: ({ row }) => <p>{row.original.accrualEnabled ? "Yes" : "No"}</p>,
  },
  {
    accessorKey: "accrualFrequency",
    header: "Frequency",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.accrualFrequency || "—"}</span>
    ),
  },
  {
    accessorKey: "accrualAmount",
    header: "Accrual Amount",
    cell: ({ row }) => <span>{row.original.accrualAmount || "—"}</span>,
  },
  {
    accessorKey: "allowCarryover",
    header: "Carryover",
    cell: ({ row }) => <div>{row.original.allowCarryover ? "Yes" : "No"}</div>,
  },
  {
    accessorKey: "maxBalance",
    header: "Max Balance",
    cell: ({ row }) => <span>{row.original.maxBalance ?? "—"}</span>,
  },
  {
    accessorKey: "isSplittable",
    header: "Splittable",
    cell: ({ row }) => <p>{row.original.isSplittable ? "Yes" : "No"}</p>,
  },
  {
    accessorKey: "genderEligibility",
    header: "Eligibility",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.genderEligibility ?? "Any"}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-2">
          <LeavePolicyModal isEditing={true} initialData={row.original} />
          <DataTableRowActions
            row={row}
            basePath="leave-policies"
            getId={(data) => data?.id}
          />
        </div>
      );
    },
  },
];
