"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { LuImport } from "react-icons/lu";
import PageHeader from "@/shared/ui/page-header";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { JobRole } from "@/types/job-roles.type";
import JobRoleModal from "./JobRoleModal";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import EmptyState from "@/shared/ui/empty-state";
import { DataTable } from "@/shared/ui/data-table";
import { jobRolesColumns } from "./job-roles-columns";
import { HiOutlineBriefcase } from "react-icons/hi2";

const JobRoles = () => {
  const { data: session, status } = useSession();
  const axiosAuth = useAxiosAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMultipleOpen, setIsMultipleOpen] = React.useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await axiosAuth.get("/api/job-roles");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: jobRoles,
    isLoading,
    isError,
  } = useQuery<JobRole[]>({
    queryKey: ["job-roles"],
    queryFn: fetchDepartments,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="space-y-10 px-6">
      <PageHeader title="Job Roles" description="Manage your departments here.">
        <Button onClick={() => setIsMultipleOpen(true)}>
          <LuImport size={16} />
          Import
        </Button>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} />
          Add Job Role
        </Button>
      </PageHeader>
      <JobRoleModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <BulkUploadModal
        isOpen={isMultipleOpen}
        onClose={() => setIsMultipleOpen(false)}
        title="Bulk Import Job Roles"
        endpoint="/api/job-roles/bulk"
        refetchKey="job-roles onboarding"
        successMessage="Job Roles uploaded successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585678/job_roles_o8yiu8.xlsx"
        exampleDownloadLabel=""
      />

      {jobRoles?.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Job Roles Found"
            description="You can create a new job role by clicking the button above."
            icon={<HiOutlineBriefcase />}
          />
        </div>
      ) : (
        <DataTable
          columns={jobRolesColumns}
          data={jobRoles}
          filterKey="title"
          filterPlaceholder="Filter roles..."
        />
      )}
    </section>
  );
};

export default JobRoles;
