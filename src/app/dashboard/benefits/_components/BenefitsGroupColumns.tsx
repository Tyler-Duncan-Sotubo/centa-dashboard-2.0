import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { BenefitGroupSheet } from "./BenefitGroupSheet";
import { BenefitGroup } from "@/types/benefits.type";

export const BenefitsGroupColumns: ColumnDef<BenefitGroup>[] = [
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
    header: "Group Name",
    cell: ({ row }) => (
      <span className="font-medium capitalize">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <span>{row.original.description}</span>,
  },
  {
    accessorKey: "rules",
    header: "Rules",
    cell: ({ row }) => {
      const rules = row.original.rules as {
        minAge?: number;
        minMonths?: number;
        onlyConfirmed?: boolean;
      };

      if (!rules) return <span>—</span>;

      const items: string[] = [];

      if (rules.onlyConfirmed) items.push("Only confirmed employees");
      if (rules.minMonths) items.push(`Min ${rules.minMonths} months`);
      if (rules.minAge) items.push(`Min age ${rules.minAge}`);

      return (
        <ul className="text-sm text-muted-foreground list-disc list-inside">
          {items.length > 0 ? (
            items.map((rule, idx) => <li key={idx}>{rule}</li>)
          ) : (
            <li>—</li>
          )}
        </ul>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="text-center flex items-center justify-center gap-2">
        <BenefitGroupSheet
          groupId={row.original.id}
          defaultValues={row.original}
        />
        <DeleteIconDialog itemId={row.original.id} type="benefit-groups" />
      </div>
    ),
  },
];
