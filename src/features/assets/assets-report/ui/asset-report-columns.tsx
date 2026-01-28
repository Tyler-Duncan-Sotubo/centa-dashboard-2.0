"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetReport } from "@/features/assets/assets-report/types/asset-report.type";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { Avatars } from "@/shared/ui/avatars";
import { AssetReportModal } from "./asset-report-modal";

export const AssetReportColumns: ColumnDef<AssetReport>[] = [
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
    accessorKey: "assetName",
    header: "Asset",
  },
  {
    accessorKey: "reportType",
    header: "Report Type",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "N/A",
  },
  {
    accessorKey: "reportedAt",
    header: "Reported At",
    cell: ({ row }) =>
      format(new Date(row.original.reportedAt), "MMM dd, yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      // Map status to allowed Badge variants
      let variant:
        | "rejected"
        | "pending"
        | "ongoing"
        | "paid"
        | "completed"
        | "approved"
        | undefined = undefined;
      if (status === "resolved" || status === "approved") {
        variant = "approved";
      } else if (status === "rejected") {
        variant = "rejected";
      } else if (status === "pending") {
        variant = "pending";
      } else if (status === "ongoing") {
        variant = "ongoing";
      } else if (status === "paid") {
        variant = "paid";
      } else if (status === "completed") {
        variant = "completed";
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const report = row.original;
      return (
        <div className="flex items-center gap-2">
          <AssetReportModal
            id={report.id}
            initialStatus={row.original.status}
            initialAssetStatus={report.assetStatus}
          />
        </div>
      );
    },
  },
];
