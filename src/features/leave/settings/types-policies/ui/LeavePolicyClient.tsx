"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { LuImport } from "react-icons/lu";
import { DataTable } from "@/shared/ui/data-table";

import { LeaveTypesColumns } from "./leaveTypesColumns";
import { LeavePoliciesColumns } from "./LeavePoliciesColumns";
import { LeavePolicyModal } from "./LeavePolicyModal";
import LeaveTypeModal from "./LeaveTypeModal";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { useLeavePolicies } from "../hooks/use-leave-policies";
import { useLeaveTypes } from "../hooks/use-leave-types";

export const LeavePolicyClient = () => {
  const [activeTab, setActiveTab] = React.useState("types");
  const [isBulkUploadLeaveTypes, setBulkUploadOpenLeaveTypes] =
    React.useState(false);
  const [isBulkUploadLeavePolicies, setBulkUploadOpenLeavePolicies] =
    React.useState(false);

  const {
    data: leavePolicies,
    isLoading: isLoadingPolicies,
    isError: isErrorPolicies,
  } = useLeavePolicies();

  const {
    data: leaveTypes,
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
  } = useLeaveTypes();

  if (isLoadingPolicies || isLoadingTypes) return <Loading />;

  if (isErrorPolicies || isErrorTypes) {
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
            <Button onClick={() => setBulkUploadOpenLeaveTypes(true)}>
              <LuImport />
              Import
            </Button>
            <LeaveTypeModal />
          </div>
        )}

        {activeTab === "policies" && (
          <div className="space-x-2">
            <Button onClick={() => setBulkUploadOpenLeavePolicies(true)}>
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
