// permissions.ts

export type Role =
  | "super_admin"
  | "hr_manager"
  | "manager"
  | "employee"
  | "finance_officer"
  | "payroll_specialist"
  | "guest";

export const Roles: Role[] = [
  "super_admin",
  "hr_manager",
  "manager",
  "employee",
  "finance_officer",
  "payroll_specialist",
  "guest",
];
