import React from "react";
import LeaveCalendar from "./LeaveCalendar";
import { Holiday, Leave } from "@/types/leave.type";

type Props = {
  leaveRequests: Leave[] | undefined;
  holidays: Holiday[] | undefined;
};

const Calendar = ({ leaveRequests, holidays }: Props) => {
  return <LeaveCalendar leaves={leaveRequests} holidays={holidays} />;
};

export default Calendar;
