"use client";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { FaCalendarCheck } from "react-icons/fa";
import Calendar from "./Calendar";
import { useLeaveManagement } from "../../leave-management/hooks/use-leave-management";

export default function LeaveCalendarClient() {
  const leave = useLeaveManagement();

  if (leave.sessionStatus === "loading" || leave.isLoading) return <Loading />;

  if (leave.isError) {
    return (
      <div className="p-6">
        <p>Error loading leave calendar.</p>
      </div>
    );
  }

  const holidays = leave.data?.holidays ?? [];
  const leaveRequests = leave.data?.leaveRequests ?? [];

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
}
