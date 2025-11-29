/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";

import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LuImport } from "react-icons/lu";
import EmptyState from "@/components/empty-state";
import { DepartmentsTable } from "@/components/common/tables/departments.table";

import DepartmentModal from "./DepartmentModal";
import BulkUploadModal from "@/components/common/BulkUploadModal";

import { Department } from "@/types/employees.type";

export default function Departments() {
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
    <section className="space-y-10 px-6">
      <PageHeader
        title="Departments"
        description="Manage your departments here."
      >
        <Button onClick={() => setIsBulkOpen(true)}>
          <LuImport size={16} />
          Import
        </Button>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          Add Department
        </Button>
      </PageHeader>

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
        <EmptyState
          title="No Departments Found"
          description="You don’t have any departments yet. Once departments are created, they’ll appear here."
          image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585355/department_jjl1xj.svg"
        />
      ) : (
        <DepartmentsTable data={departments} />
      )}
    </section>
  );
}
