"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { Asset } from "@/features/assets/core/types/asset.type";
import clsx from "clsx";

type AssetStatus = Asset["status"];

interface AssetStatusSelectProps {
  assetId: string;
  status: AssetStatus;
}

const statusColors = {
  available: "bg-green-200 text-green-700",
  assigned: "bg-blue-200 text-blue-700",
  maintenance: "bg-yellow-200 text-yellow-700",
  retired: "bg-gray-200 text-gray-700",
  lost: "bg-red-100 text-red-700",
};

const statusOptions: AssetStatus[] = [
  "available",
  "assigned",
  "maintenance",
  "retired",
  "lost",
];

export default function AssetStatusSelect({
  assetId,
  status,
}: AssetStatusSelectProps) {
  const statusClass = clsx(
    "text-xs px-2 py-1 rounded-md w-[120px] h-6 text-center font-bold",
    statusColors[status],
  );

  const update = useUpdateMutation({
    endpoint: `/api/assets/${assetId}/status`,
    successMessage: "Asset updated",
    refetchKey: "assets",
  });

  const handleStatusChange = async (newStatus: AssetStatus) => {
    await update({
      status: newStatus,
    });
  };

  return (
    <Select defaultValue={status} onValueChange={handleStatusChange}>
      <SelectTrigger className={statusClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
