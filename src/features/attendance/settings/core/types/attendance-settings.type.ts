export type AttendanceSettings = {
  useShifts: boolean;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultWorkingDays: number;
  lateToleranceMinutes: number;
  earlyClockInWindowMinutes: number;
  blockOnHoliday: boolean;
  allowOvertime: boolean;
  overtimeRate: number;
  allowHalfDay: boolean;
  halfDayDuration: number;
};
