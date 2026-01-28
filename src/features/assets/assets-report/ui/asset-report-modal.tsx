"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Edit } from "lucide-react";
import GenericSheet from "@/shared/ui/generic-sheet";
import FormError from "@/shared/ui/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

export function AssetReportModal({
  id,
  initialStatus,
  initialAssetStatus,
}: {
  id: string;
  initialStatus?: string;
  initialAssetStatus?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>(initialStatus || "open"); // default to "open" if not provided
  const [assetStatus, setAssetStatus] = useState<string>(
    initialAssetStatus || "available", // default to "available" if not provided
  );

  const update = useUpdateMutation({
    endpoint: `/api/asset-reports/${id}`,
    successMessage: "Asset Report updated",
    refetchKey: "asset-reports",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async () => {
    await update({
      status, // update report status
      assetStatus, // update asset status
    });
  };

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Edit size={20} />
        </Button>
      }
      title="Update Asset Report"
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Update</Button>
        </div>
      }
    >
      <div className="space-y-6 mt-10">
        {/* Report Status */}
        <div>
          <label className="block font-medium mb-2">Report Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select report status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Asset Status */}
        <div>
          <label className="block font-medium mb-2">Asset Status</label>
          <Select value={assetStatus} onValueChange={setAssetStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </GenericSheet>
  );
}
