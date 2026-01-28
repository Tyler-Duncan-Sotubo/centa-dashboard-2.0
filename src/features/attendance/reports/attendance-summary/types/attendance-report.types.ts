export type AttendanceReportYearMonth = `${string}-${string}`; // "yyyy-MM"

export type AttendanceReportDailyDashboard = unknown; // replace with exact shape if you have it

export type AttendanceReportDailySummary = {
  dashboard?: AttendanceReportDailyDashboard;
};

export type AttendanceReportMonthlyRow = Record<string, unknown>; // replace with your row type

export type AttendanceReportResponse = {
  dailySummary?: {
    dashboard?: AttendanceReportDailyDashboard;
  };
  monthlySummary?: AttendanceReportMonthlyRow[];
};
