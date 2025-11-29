"use client";

import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { Holiday, Leave } from "@/types/leave.type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Requested from "./_components/Requested";
import {
  LeaveBalanceTable,
  LeaveSummary,
} from "./_components/LeaveBalanceTable";
import { LeaveRequestSheet } from "./_components/LeaveRequestSheet";
import useAxiosAuth from "@/hooks/useAxiosAuth";

interface LeaveManagement {
  holidays: Holiday[] | undefined;
  leaveRequests: Leave[] | undefined;
  leaveBalances: LeaveSummary[] | undefined;
}

const LeaveManagement = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [activeTab, setActiveTab] = React.useState("requested");

  const fetchLeaveData = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/leave-reports/leave-management"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: leaveData,
    isLoading,
    isError,
  } = useQuery<LeaveManagement>({
    queryKey: ["leave-data"],
    queryFn: fetchLeaveData,
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  const { leaveRequests, leaveBalances } = leaveData ?? {};

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
            ) : (
              ""
            )}
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
};

export default LeaveManagement;
