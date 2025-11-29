export type Shift = {
  id: string;
  name: string;
  startTime: string; // "08:00:00"
  endTime: string; // "17:00:00"
  workingDays: string[]; // ["monday", "tuesday", ...]
  lateToleranceMinutes?: number;
  allowEarlyClockIn?: boolean;
  earlyClockInMinutes?: number;
  allowLateClockOut?: boolean;
  lateClockOutMinutes?: number;
  notes?: string;
  locationName?: string;
  locationId: string;
};

export interface ShiftDashboardData {
  yearMonth: string;
  filters: {
    locationId?: string;
    departmentId?: string;
  };
  monthlySummary: MonthlySummary;
  detailedBreakdown: ShiftBreakdownRow[];
}

export interface MonthlySummary {
  yearMonth: string;
  totalShifts: number | string;
  uniqueEmployees: number | string;
  uniqueShiftTypes: number | string;
}

export interface ShiftBreakdownRow {
  employeeId: string;
  employeeName: string;
  shiftName: string;
  locationName: string;
  startTime: string; // "09:00:00"
  endTime: string; // "17:00:00"
  daysScheduled: number | string;
  daysPresent: number | string;
  daysExpected: number;
  yearMonth: string;
}
