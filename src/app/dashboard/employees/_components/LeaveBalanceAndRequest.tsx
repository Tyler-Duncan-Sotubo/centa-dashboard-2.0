import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Badge } from "@/shared/ui/badge";

interface LeaveBalanceEntry {
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitlement: string;
  used: string;
  balance: string;
}

interface LeaveRequestEntry {
  requestId: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

interface LeaveProps {
  leaveBalance: LeaveBalanceEntry[];
  leaveRequests: LeaveRequestEntry[];
}

const leaveRequestColumns: ColumnDef<LeaveRequestEntry>[] = [
  {
    accessorKey: "leaveType",
    header: "Leave Type",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.getValue("endDate")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "approved"
              ? "approved"
              : status === "pending"
                ? "pending"
                : "pending"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
];

const getIconForLeaveType = (type: string) => {
  switch (type.toLowerCase()) {
    case "annual leave":
      return <span className="text-xl">🏖️</span>;
    case "sick leave":
      return <span className="text-xl">🤒</span>;
    case "unpaid leave":
      return <span className="text-xl">💸</span>;
    case "compensatory leave":
      return <span className="text-xl">⏱️</span>;
    default:
      return <span className="text-xl">📅</span>;
  }
};

export default function LeaveBalanceAndRequest({
  leaveBalance,
  leaveRequests,
}: LeaveProps) {
  return (
    <div className="grid gap-6 mt-10">
      <Swiper spaceBetween={16} slidesPerView={"auto"} className="w-full pb-4">
        {leaveBalance.map((entry) => (
          <SwiperSlide key={entry.leaveTypeId} style={{ width: "300px" }}>
            <div className="p-4 h-full rounded-lg shadow-lg  border">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white">
                  {getIconForLeaveType(entry.leaveTypeName)}
                </div>
                <h3 className="text-md font-medium">{entry.leaveTypeName}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Year: {entry.year}
              </div>
              <div className="mt-4">
                <div className="text-md">
                  Available:{" "}
                  <span className="font-semibold text-lg">
                    {parseFloat(entry.balance).toLocaleString()}
                  </span>
                </div>
                <div className="text-md">
                  Used:{" "}
                  <span className="font-semibold text-lg">
                    {parseFloat(entry.used).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <DataTable columns={leaveRequestColumns} data={leaveRequests} />
    </div>
  );
}
