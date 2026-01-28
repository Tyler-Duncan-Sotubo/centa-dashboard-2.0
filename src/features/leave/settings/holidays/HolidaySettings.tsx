"use client";

import React from "react";
import { HolidayColumns } from "./HolidayColumns";
import { Holiday } from "@/types/holiday.type";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { HolidayModal } from "./HolidayModal";
import { Button } from "@/shared/ui/button";
import { LuImport } from "react-icons/lu";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DataTable } from "@/shared/ui/data-table";

const HolidaySettings = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [isBulkUploadHolidays, setBulkUploadHolidays] = React.useState(false);

  const fetchLeaveData = async () => {
    try {
      const res = await axiosInstance.get("/api/holidays/custom-holidays");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: fetchLeaveData,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Holidays"
        description="Manage your holidays and public holidays."
      >
        <Button
          onClick={() => {
            setBulkUploadHolidays(true);
          }}
        >
          <LuImport />
          Import
        </Button>
        <HolidayModal />
      </PageHeader>
      <DataTable columns={HolidayColumns} data={data} />

      <BulkUploadModal
        isOpen={isBulkUploadHolidays}
        onClose={() => setBulkUploadHolidays(false)}
        title="Upload Holidays"
        endpoint="/api/holidays/bulk"
        refetchKey="holidays"
        successMessage="Holidays added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585680/holidays_psoo25.csv"
        exampleDownloadLabel=""
      />
    </div>
  );
};

export default HolidaySettings;
