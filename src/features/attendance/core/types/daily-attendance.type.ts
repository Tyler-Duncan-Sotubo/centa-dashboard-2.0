import {
  AttendanceDetails,
  AttendanceMetrics,
  AttendanceSummaryItem,
} from "./attendance.type";

export type DailyAttendance = {
  details: AttendanceDetails;
  metrics: AttendanceMetrics;
  summaryList?: AttendanceSummaryItem[];
};
