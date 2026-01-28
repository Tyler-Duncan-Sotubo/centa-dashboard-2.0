"use client";

import { useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import { FaPlus } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import { LuImport } from "react-icons/lu";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import Loading from "@/shared/ui/loading";

import { useShiftsQuery } from "../hooks/use-shifts-query";
import { ShiftModal } from "./shift-modal";
import { ShiftColumns } from "./shift-columns";

export function ShiftManagementView() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError } = useShiftsQuery();

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-red-500">Failed to load shifts</div>;

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Shift Management"
        description="Manage your shifts and working hours"
        icon={<FaPlus className="text-2xl" />}
      >
        <div className="space-x-3">
          <Button onClick={() => setIsOpen(true)}>
            <LuImport />
            Bulk Import
          </Button>
          <ShiftModal />
        </div>
      </PageHeader>

      <div className="mt-14">
        <DataTable columns={ShiftColumns} data={data} />
      </div>

      <BulkUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bulk Upload Shifts"
        endpoint="/api/shifts/bulk"
        refetchKey="shifts"
        successMessage="shifts added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585674/shifts_cfjvkq.xlsx"
        exampleDownloadLabel=""
      />
    </div>
  );
}
