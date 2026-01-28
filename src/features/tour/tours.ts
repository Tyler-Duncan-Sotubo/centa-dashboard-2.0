import { staffDepartmentsTour } from "./definitions/staff.departments.tour";
import { TourDefinition, TourId } from "./types/tours-id.types";

export const tours: Record<TourId, TourDefinition> = {
  // STAFF
  "staff.departments": staffDepartmentsTour,

  // placeholders (safe while you build)
  "staff.job-roles": {
    id: "staff.job-roles",
    version: 1,
    steps: [],
  },
  "staff.teams": {
    id: "staff.teams",
    version: 1,
    steps: [],
  },
  "staff.onboarding-templates": {
    id: "staff.onboarding-templates",
    version: 1,
    steps: [],
  },
  "staff.employees": {
    id: "staff.employees",
    version: 1,
    steps: [],
  },

  // LEAVE
  "leave.types-policies": {
    id: "leave.types-policies",
    version: 1,
    steps: [],
  },
  "leave.holidays": {
    id: "leave.holidays",
    version: 1,
    steps: [],
  },
  "leave.calendar": {
    id: "leave.calendar",
    version: 1,
    steps: [],
  },

  // ATTENDANCE
  "attendance.settings": {
    id: "attendance.settings",
    version: 1,
    steps: [],
  },
  "attendance.shift-management": {
    id: "attendance.shift-management",
    version: 1,
    steps: [],
  },
  "attendance.rotas": {
    id: "attendance.rotas",
    version: 1,
    steps: [],
  },

  // PAYROLL
  "payroll.pay-schedules": {
    id: "payroll.pay-schedules",
    version: 1,
    steps: [],
  },
  "payroll.pay-groups": {
    id: "payroll.pay-groups",
    version: 1,
    steps: [],
  },
  "payroll.run": {
    id: "payroll.run",
    version: 1,
    steps: [],
  },
};
