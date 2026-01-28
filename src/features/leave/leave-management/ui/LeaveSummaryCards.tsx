"use client";

import React from "react";
import { CalendarDays } from "lucide-react"; // Lucide icons
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { FaCircleXmark } from "react-icons/fa6";

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

type Props = {
  leaves: LeaveRequest[] | undefined;
};

const LeaveSummaryCards = ({ leaves }: Props) => {
  const summary = leaves?.reduce(
    (acc, leave) => {
      const days = Number(leave.totalDays ?? 0);

      acc.total += days;

      switch (leave.status) {
        case "approved":
          acc.approved += days;
          break;
        case "rejected":
          acc.rejected += days;
          break;
        case "pending":
          acc.pending += days;
          break;
      }

      return acc;
    },
    { total: 0, approved: 0, rejected: 0, pending: 0 }
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card
        icon={<CalendarDays className="w-6 h-6 " />}
        title="Total Time Off"
        value={`${summary?.total}`}
      />
      <Card
        icon={<FaCircleCheck className="w-6 h-6 " />}
        title="Approved"
        value={`${summary?.approved}`}
      />
      <Card
        icon={<MdOutlineAccessTimeFilled className="w-6 h-6 0" />}
        title="Pending"
        value={`${summary?.pending}`}
      />
      <Card
        icon={<FaCircleXmark className="w-6 h-6 " />}
        title="Rejected"
        value={`${summary?.rejected}`}
      />
    </div>
  );
};

export default LeaveSummaryCards;

// Card sub-component
const Card = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="rounded-lg border bg-white p-4 shadow-2xs space-y-3">
    <div className="inline-block rounded-md mb-2 p-3 shadow-xl border text-monzo-background ">
      {icon}
    </div>
    <div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground font-semibold">{title}</p>
    </div>
  </div>
);
