import type { AxiosInstance } from "axios";
import { attendanceMonthResponseSchema } from "../schema/employee-attendance.schema";
import type { AttendanceRecord } from "../types/employee-attendance.types";

type GetEmployeeAttendanceMonthParams = {
  employeeId: string;
  yearMonth: string; // yyyy-MM
};

export async function getEmployeeAttendanceMonth(
  axios: AxiosInstance,
  params: GetEmployeeAttendanceMonthParams,
): Promise<AttendanceRecord[]> {
  const res = await axios.get(
    `/api/clock-in-out/employee-attendance-month?employeeId=${params.employeeId}&yearMonth=${params.yearMonth}`,
  );

  // validate response shape (optional but recommended)
  const parsed = attendanceMonthResponseSchema.parse(res);
  return parsed.data.data.summaryList;
}
