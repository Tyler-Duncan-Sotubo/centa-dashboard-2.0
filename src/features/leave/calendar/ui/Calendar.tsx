import { Holiday, Leave } from "../../types/leave.type";
import LeaveCalendar from "./LeaveCalendar";

type Props = {
  leaveRequests: Leave[] | undefined;
  holidays: Holiday[] | undefined;
};

const Calendar = ({ leaveRequests, holidays }: Props) => {
  return <LeaveCalendar leaves={leaveRequests} holidays={holidays} />;
};

export default Calendar;
