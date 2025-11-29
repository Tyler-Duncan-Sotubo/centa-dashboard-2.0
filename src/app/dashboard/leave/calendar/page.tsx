"use client";

import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { Holiday } from "@/types/holiday.type";
import { Leave } from "@/types/leave.type";
import { useSession } from "next-auth/react";
import React from "react";
import { LeaveSummary } from "../_components/LeaveBalanceTable";
import Calendar from "../_components/Calendar";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/pageHeader";
import { FaCalendarCheck } from "react-icons/fa";

interface LeaveManagement {
  holidays: Holiday[] | undefined;
  leaveRequests: Leave[] | undefined;
  leaveBalances: LeaveSummary[] | undefined;
}
const LeaveCalendarPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

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

  const { holidays, leaveRequests } = leaveData ?? {};

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
    <div className="px-4">
      <PageHeader
        title="Leave Calendar"
        description="View and manage employee leave requests and holidays in the calendar."
        icon={<FaCalendarCheck size={20} />}
      />
      <Calendar leaveRequests={leaveRequests} holidays={holidays} />
    </div>
  );
};

export default LeaveCalendarPage;
