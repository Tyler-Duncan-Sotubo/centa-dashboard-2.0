// _components/StageHistoryColumns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export type StageHistoryItem = {
  name: string;
  movedAt: string;
  movedBy: string;
};

export const stageHistoryColumns: ColumnDef<StageHistoryItem>[] = [
  {
    accessorKey: "name",
    header: "Stage",
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: "movedAt",
    header: "Moved At",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.movedAt), "PPPpp")}</div>
    ),
  },
  {
    accessorKey: "movedBy",
    header: "Moved By",
    cell: ({ row }) => <div>{row.original.movedBy}</div>,
  },
];
