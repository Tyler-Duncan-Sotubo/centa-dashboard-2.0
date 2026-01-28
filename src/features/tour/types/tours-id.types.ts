import { DriveStep } from "driver.js";

export type TourId =
  // Staff
  | "staff.departments"
  | "staff.job-roles"
  | "staff.teams"
  | "staff.onboarding-templates"
  | "staff.employees"
  // Leave
  | "leave.types-policies"
  | "leave.holidays"
  | "leave.calendar"
  // Attendance
  | "attendance.settings"
  | "attendance.shift-management"
  | "attendance.rotas"
  // Payroll
  | "payroll.pay-schedules"
  | "payroll.pay-groups"
  | "payroll.run";

export type TourDefinition = {
  id: TourId;
  version: number;
  steps: DriveStep[];
};
