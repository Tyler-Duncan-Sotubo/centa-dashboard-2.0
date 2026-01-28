import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { AssetRequest } from "../../asset-requests/types/asset-request.type";

export const essAssetsColumns: ColumnDef<AssetRequest>[] = [
  {
    accessorKey: "assetType",
    header: "Type",
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
  },
  {
    accessorKey: "requestDate",
    header: "Submitted",
    cell: ({ row }) =>
      format(new Date(row.original.requestDate), "dd MMM yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      const variant =
        status === "approved"
          ? "approved"
          : status === "rejected"
            ? "rejected"
            : "pending";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "rejectionReason",
    header: "Reason",
    cell: ({ row }) =>
      row.original.status.toLowerCase() === "rejected" ? (
        <span className="text-xs text-red-600">
          {row.original.rejectionReason || "—"}
        </span>
      ) : null,
  },
];
