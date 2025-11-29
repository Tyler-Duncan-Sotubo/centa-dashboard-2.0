export interface Holiday {
  date: string;
  name: string;
  type: string;
}

export type Leave = {
  id: string;
  leave_type: string;
  title?: string; // optional if not always present
  employee_id: string;
  employee_name: string;
  employee_last_name?: string;
  start_date: string;
  end_date: string;
  total_days_off: number;
  leave_status: "pending" | "approved" | "rejected" | string; // extend as needed
  approved_by?: string;
  requestId: string;
  employeeName: string;
  leaveType: string;
  startDate: string; // ISO
  endDate: string; // ISO
  status: string; // e.g., "approved", "pending", etc.
  reason?: string;
  department?: string;
  totalDays: string;
};

export type Props = {
  leaves: Leave[] | undefined;
  holidays: Holiday[] | undefined;
};

export type LeaveSummaryType = {
  id: string;
  leave_type: string;
  leave_entitlement: number;
  used: number | string;
};

export type LeaveBalanceType = {
  id: string;
  leave_type: string;
  total_leave_days: number;
  used_leave_days: number;
  used: number;
  remaining: number;
  entitlement: number;
  total: number;
  remaining_leave_days: number;
  employee_id: string;
  leave_entitlement: number;
};

export interface LeaveType {
  id: string;
  name: string; // e.g., "Vacation Leave"
  isPaid: boolean; // true if paid leave
  colorTag?: string; // optional HEX color code for UI
  companyId: string; // foreign key to the company
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface LeavePolicy {
  id: string;
  companyId: string; // foreign key to the company
  leaveTypeId: string; // foreign key to LeaveType
  leaveTypeName?: string; // OPTIONAL: denormalized for UI convenience

  accrualEnabled: boolean;
  accrualFrequency?: "monthly" | "quarterly" | "annually" | string;
  accrualAmount?: string; // decimal string for precision

  maxBalance?: string;
  allowCarryover: boolean;
  carryoverLimit?: number;

  onlyConfirmedEmployees: boolean;
  genderEligibility?: "male" | "female" | "any" | string;

  manualEntitlement?: number;
  grantOnStart: boolean;

  eligibilityRules?: Record<string, unknown>; // parsed from JSONB
  isSplittable: boolean;

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type LeaveRequest = {
  requestId: string;
  employeeName: string;
  leaveType: string;
  startDate: string; // ISO
  endDate: string; // ISO
  status: string; // e.g., "approved", "pending", etc.
};
