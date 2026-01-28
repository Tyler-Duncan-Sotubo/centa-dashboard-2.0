/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { LuImport } from "react-icons/lu";
import EmptyState from "@/shared/ui/empty-state";
import DepartmentModal from "./DepartmentModal";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { DataTable } from "@/shared/ui/data-table";
import { departmentsColumns } from "./departments-columns";
import { Department } from "../types/department.type";
import { TourLauncher } from "@/features/tour/TourLauncher";
import { TakeTourButton } from "@/features/tour/TakeTourButton";
import { HiBuildingOffice } from "react-icons/hi2";

export default function DepartmentsClient() {
  const { data: session, status } = useSession();
  const axiosAuth = useAxiosAuth();

  // Local modal state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);

  // Fetcher
  const fetchDepartments = async (): Promise<Department[]> => {
    try {
      const res = await axiosAuth.get("/api/department");
      return res.data?.data ?? [];
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      throw error;
    }
  };

  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <section className="px-6">
        <div className="text-sm text-red-600 border p-3 rounded-lg">
          Error loading departments.
        </div>
      </section>
    );

  return (
    <section className="space-y-10 px-6 ">
      <div data-tour="departments.page">
        <PageHeader
          title="Departments"
          description="Manage your departments here."
        >
          <TakeTourButton id="staff.departments" />
          <Button
            data-tour="departments.import"
            onClick={() => setIsBulkOpen(true)}
          >
            <LuImport size={16} />
            Import
          </Button>
          <Button
            data-tour="departments.add"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            Add Department
          </Button>
        </PageHeader>
      </div>

      {/* Create single modal */}
      <DepartmentModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
        }}
      />

      {/* Bulk import modal */}
      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Import Departments"
        endpoint="/api/department/bulk"
        refetchKey="departments onboarding"
        successMessage="Departments added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585682/department_ee9hgy.xlsx"
        exampleDownloadLabel=""
      />

      {departments.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Departments Found"
            description="You don’t have any departments yet. Once departments are created, they’ll appear here."
            icon={<HiBuildingOffice />}
          />
        </div>
      ) : (
        <DataTable
          columns={departmentsColumns}
          data={departments}
          filterKey="name"
          filterPlaceholder="Filter department..."
        />
      )}
    </section>
  );
}
