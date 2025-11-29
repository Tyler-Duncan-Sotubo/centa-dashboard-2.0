export interface AttendanceSummaryItem {
  employee_id: string;
  name: string;
  department: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "absent" | "clocked_in" | string;
  isLate: boolean;
  employeeNumber: string;
  totalWorkedMinutes: number;
}

export interface AttendanceMetrics {
  attendanceChangePercent: number;
  lateChangePercent: number;
  absentChange: string;
  averageCheckInTimeChange: {
    today: string;
    yesterday: string;
  };
}

export interface AttendanceDetails {
  date: string;
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: string;
  averageCheckInTime: string;
}
