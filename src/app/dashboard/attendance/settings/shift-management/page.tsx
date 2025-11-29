"use client";

import { DataTable } from "@/components/DataTable";
import React, { useState } from "react";
import { ShiftColumns } from "../_components/ShiftColumns";
import PageHeader from "@/components/pageHeader";
import { FaPlus } from "react-icons/fa";
import { ShiftModal } from "../_components/ShiftModal";
import { Button } from "@/components/ui/button";
import { LuImport } from "react-icons/lu";
import BulkUploadModal from "@/components/common/BulkUploadModal";
import Loading from "@/components/ui/loading";
import { Shift } from "@/types/shift.type";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const ShiftPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [isOpen, setIsOpen] = useState(false);

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get("/api/shifts");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<Shift[]>({
    queryKey: ["shifts"],
    queryFn: fetchShifts,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-500">Failed to load leave settings</div>;

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Shift Management"
        description="Manage your shifts and working hours"
        icon={<FaPlus className="text-2xl" />}
      >
        <div className="space-x-3">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
          >
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
};

export default ShiftPage;
