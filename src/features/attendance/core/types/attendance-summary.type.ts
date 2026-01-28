import type {
  AttendanceDetails,
  AttendanceMetrics,
  AttendanceSummaryItem,
} from "@/features/attendance/core/types/attendance.type";

export type DailyDashboardAttendance = {
  details: AttendanceDetails;
  metrics: AttendanceMetrics;
  summaryList?: AttendanceSummaryItem[];
};

export type AttendanceSummaryResponse = {
  summaryList?: AttendanceSummaryItem[];
};
