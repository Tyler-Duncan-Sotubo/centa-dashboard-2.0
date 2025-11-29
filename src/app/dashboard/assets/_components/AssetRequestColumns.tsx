"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetRequest } from "@/types/asset-request.type";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AssetApprovalSheet } from "./AssetApprovalSheet";
import { Avatars } from "@/components/avatars";

export const AssetRequestColumns: ColumnDef<AssetRequest>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => {
      const employeeName = row.original.employeeName || "N/A";
      return (
        <div className="flex items-center gap-2">
          {Avatars({ name: employeeName })}
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">{employeeName}</p>
            <p className="text-sm text-gray-600">
              {row.original.employeeEmail}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "assetType",
    header: "Asset Type",
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
  },
  {
    accessorKey: "urgency",
    header: "Urgency",
    cell: ({ row }) => {
      const urgency = row.original.urgency;
      // Map urgency to allowed Badge variants
      const color:
        | "approved"
        | "rejected"
        | "pending"
        | "ongoing"
        | "paid"
        | "completed"
        | null
        | undefined =
        urgency === "Critical"
          ? "rejected"
          : urgency === "High"
          ? "pending"
          : "approved";

      return <Badge variant={color}>{urgency}</Badge>;
    },
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    cell: ({ row }) =>
      format(new Date(row.original.requestDate), "MMM dd, yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      // Map status to allowed Badge variants
      const color:
        | "approved"
        | "rejected"
        | "pending"
        | "ongoing"
        | "paid"
        | "completed"
        | null
        | undefined =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "pending";
      const request = row.original;
      return (
        <div className="flex items-center gap-2">
          {request.status === "approved" || request.status === "rejected" ? (
            <Badge variant={color}>{status}</Badge>
          ) : (
            <AssetApprovalSheet assetRequestId={request.id} />
          )}
        </div>
      );
    },
  },
];
