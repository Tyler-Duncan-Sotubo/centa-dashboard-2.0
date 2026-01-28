export interface Report {
  title: string;
  link: string;
}

export interface ReportCategory {
  category: string;
  reports: Report[];
}

// Data for Reports
export const reportData: ReportCategory[] = [
  {
    category: "Payroll Reports",
    reports: [
      {
        title: "Payroll Summary",
        link: "/dashboard/reports/payroll-summary",
      },
      {
        title: "Salary Report - Monthly",
        link: "/dashboard/reports/salary-report-monthly",
      },
      {
        title: "Deductions Summary",
        link: "/dashboard/reports/deductions-summary",
      },
      {
        title: "YTD Payroll Report",
        link: "/dashboard/reports/payroll-ytd",
      },
      {
        title: "Off Cycle Payroll Report",
        link: "/dashboard/reports/payroll-off-cycle",
      },
      {
        title: "Variance Report",
        link: "/dashboard/reports/payroll-variance-report",
      },
      {
        title: "Payroll Cost Reports",
        link: "/dashboard/reports/payroll-cost-report",
      },
      {
        title: "GL Summary Report",
        link: "/dashboard/reports/gl-summary-report",
      },
    ],
  },
  {
    category: "Employee Reports",
    reports: [
      // {
      //   title: "Employee Salary Breakdown",
      //   link: "/dashboard/reports/employee-salary-breakdown",
      // },
      // {
      //   title: "Employee Performance Report",
      //   link: "/dashboard/reports/employee-performance",
      // },
      {
        title: "Reimbursement Report",
        link: "/dashboard/reports/reimbursement-report",
      },
    ],
  },
  {
    category: "Loan Reports",
    reports: [
      {
        title: "Loan Summary Report",
        link: "/dashboard/reports/loan-summary",
      },
      {
        title: "Loan Repayment Report",
        link: "/dashboard/reports/loan-repayment",
      },
    ],
  },
];

export const payrollReportData: ReportCategory[] = [
  {
    category: "Payroll Reports",
    reports: [
      {
        title: "Payroll Summary",
        link: "/dashboard/payroll/reports/summary",
      },
      {
        title: "Salary Report - Monthly",
        link: "/dashboard/payroll/reports/salary-report-monthly",
      },
      {
        title: "Deductions Summary",
        link: "/dashboard/payroll/reports/deductions-summary",
      },
      {
        title: "YTD Payroll Report",
        link: "/dashboard/payroll/reports/ytd",
      },
      {
        title: "Off Cycle Payroll Report",
        link: "/dashboard/payroll/reports/off-cycle",
      },
      {
        title: "Variance Report",
        link: "/dashboard/payroll/reports/variance-report",
      },
      {
        title: "Payroll Cost Reports",
        link: "/dashboard/payroll/reports/cost-report",
      },
      {
        title: "GL Summary Report",
        link: "/dashboard/payroll/reports/gl-summary-report",
      },
    ],
  },
  {
    category: "Loan Reports",
    reports: [
      {
        title: "Loan Summary Report",
        link: "/dashboard/payroll/reports/loan-summary",
      },
      {
        title: "Loan Repayment Report",
        link: "/dashboard/payroll/reports/loan-repayment",
      },
    ],
  },
  {
    category: "Expense Reports",
    reports: [
      {
        title: "Reimbursement Report",
        link: "/dashboard/payroll/reports/reimbursement-report",
      },
    ],
  },
];

export const timeOffReportData: ReportCategory[] = [
  {
    category: "Leave Reports",
    reports: [
      {
        title: "Leave Balance Report",
        link: "/dashboard/attendance/reports/leave-balance",
      },
      {
        title: "Leave Utilization Report",
        link: "/dashboard/attendance/reports/leave-utilization",
      },
    ],
  },
  {
    category: "Attendance Reports",
    reports: [
      {
        title: "Attendance Summary",
        link: "/dashboard/attendance/reports/attendance-summary",
      },
      {
        title: "Department Attendance Summary",
        link: "/dashboard/attendance/reports/attendance-summary-department",
      },
      {
        title: "Shift Report",
        link: "/dashboard/attendance/reports/attendance-shift-report",
      },
    ],
  },
];

export const performanceReportData: ReportCategory[] = [
  {
    category: "Appraisal & Goal Reports",
    reports: [
      {
        title: "Appraisal Summary Report",
        link: "/dashboard/performance/reports/appraisal-summary",
      },
      {
        title: "Goal Achievement Report",
        link: "/dashboard/performance/reports/goal-achievement",
      },
      {
        title: "Feedback Report",
        link: "/dashboard/performance/reports/feedback",
      },
      {
        title: "Competency Heatmap Report",
        link: "/dashboard/performance/reports/competency-heatmap",
      },
    ],
  },
];
