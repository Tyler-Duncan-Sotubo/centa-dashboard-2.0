"use client";

import React, { useState } from "react";
import Loading from "@/shared/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Holiday,
  Leave,
  LeaveSummary,
} from "@/features/leave/types/leave.type";
import { useLeaveManagement } from "../hooks/use-leave-management";
import { LeaveBalanceTable } from "./LeaveBalanceTable";
import Requested from "./Requested";
import { LeaveRequestSheet } from "./LeaveRequestSheet";

interface LeaveManagementData {
  holidays?: Holiday[];
  leaveRequests?: Leave[];
  leaveBalances?: LeaveSummary[];
}

export default function LeaveManagementClient() {
  const [activeTab, setActiveTab] = useState("requested");

  // reuse the same queryKey ("leave-data") you already use everywhere
  const leave = useLeaveManagement();

  if (leave.sessionStatus === "loading" || leave.isLoading) return <Loading />;

  if (leave.isError) {
    return (
      <div className="p-6">
        <p>Error loading leave management.</p>
      </div>
    );
  }

  const leaveData = (leave.data ?? {}) as LeaveManagementData;
  const leaveRequests = leaveData.leaveRequests ?? [];
  const leaveBalances = leaveData.leaveBalances ?? [];

  return (
    <div className="px-5 mb-10">
      <Tabs
        defaultValue="requested"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-10"
      >
        <div className="flex justify-between items-center mb-8">
          <TabsList>
            <TabsTrigger value="requested">Requested</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>

          <div className="flex justify-end">
            {activeTab === "requested" ? (
              <div className="space-x-2">
                <LeaveRequestSheet />
              </div>
            ) : null}
          </div>
        </div>

        <TabsContent value="requested">
          <Requested leaveRequests={leaveRequests} />
        </TabsContent>

        <TabsContent value="balance">
          <LeaveBalanceTable data={leaveBalances} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
