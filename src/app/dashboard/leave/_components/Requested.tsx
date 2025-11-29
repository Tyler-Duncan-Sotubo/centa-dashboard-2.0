"use client";

import React from "react";
import { LeaveRequestsTable } from "./LeaveRequestsTable";
import LeaveSummaryCards from "./LeaveSummaryCards";

type LeaveRequest = {
  requestId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  department?: string;
  totalDays: string;
};

const Requested = ({
  leaveRequests,
}: {
  leaveRequests: LeaveRequest[] | undefined;
}) => {
  return (
    <div>
      <LeaveSummaryCards leaves={leaveRequests} />
      <LeaveRequestsTable data={leaveRequests} />
    </div>
  );
};

export default Requested;
