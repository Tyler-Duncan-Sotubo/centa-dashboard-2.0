"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { LeaveTypesColumns } from "./_components/leaveTypesColumns";
import { LeavePoliciesColumns } from "./_components/LeavePoliciesColumns";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { LeavePolicy, LeaveType } from "@/types/leave.type";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { LuImport } from "react-icons/lu";
import { LeavePolicyModal } from "./_components/LeavePolicyModal";
import LeaveTypeModal from "./_components/LeaveTypeModal";
import BulkUploadModal from "@/components/common/BulkUploadModal";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { DataTable } from "@/components/DataTable";

const LeavePolicyPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [activeTab, setActiveTab] = React.useState("types");
  const [isBulkUploadLeaveTypes, setBulkUploadOpenLeaveTypes] =
    React.useState(false);
  const [isBulkUploadLeavePolicies, setBulkUploadOpenLeavePolicies] =
    React.useState(false);

  const fetchLeavePolicy = async () => {
    try {
      const res = await axiosInstance.get("/api/leave-policy");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/api/leave-types");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: leavePolicies,
    isLoading,
    isError,
  } = useQuery<LeavePolicy[]>({
    queryKey: ["leave-policies"],
    queryFn: fetchLeavePolicy,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  const {
    data: leaveTypes,
    isLoading: isLoadingLeaveTypes,
    isError: isErrorLeaveTypes,
  } = useQuery<LeaveType[]>({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading || isLoadingLeaveTypes) {
    return <Loading />;
  }

  if (isError || isErrorLeaveTypes) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <PageHeader
        title="Leave Policies"
        description="Manage your leave policies and types here."
      />

      <div className="flex justify-end mb-4">
        {activeTab === "types" && (
          <div className="space-x-2">
            <Button
              onClick={() => {
                setBulkUploadOpenLeaveTypes(true);
              }}
            >
              <LuImport />
              Import
            </Button>
            <LeaveTypeModal />
          </div>
        )}
        {activeTab === "policies" && (
          <div className="space-x-2">
            <Button
              onClick={() => {
                setBulkUploadOpenLeavePolicies(true);
              }}
            >
              <LuImport />
              Import
            </Button>
            <LeavePolicyModal />
          </div>
        )}
      </div>
      <Tabs
        defaultValue="types"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-10"
      >
        <TabsList>
          <TabsTrigger value="types">Leave Types</TabsTrigger>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="types">
          <DataTable columns={LeaveTypesColumns} data={leaveTypes} />
        </TabsContent>
        <TabsContent value="policies">
          <DataTable columns={LeavePoliciesColumns} data={leavePolicies} />
        </TabsContent>
      </Tabs>

      <BulkUploadModal
        isOpen={isBulkUploadLeaveTypes}
        onClose={() => setBulkUploadOpenLeaveTypes(false)}
        title="Upload Leave Types"
        endpoint="/api/leave-types/bulk"
        refetchKey="leave-types"
        successMessage="Leave types added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585676/leave_types_dvrkjq.xlsx"
        exampleDownloadLabel=""
      />

      <BulkUploadModal
        isOpen={isBulkUploadLeavePolicies}
        onClose={() => setBulkUploadOpenLeavePolicies(false)}
        title="Upload Leave Policies"
        endpoint="/api/leave-policy/bulk"
        refetchKey="leave-policies"
        successMessage="Leave policies added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585677/leave_policies_j6l6pq.xlsx"
        exampleDownloadLabel=""
      />
    </div>
  );
};

export default LeavePolicyPage;
