export type OnboardingTaskKey = "payroll" | "staff";

export const onboardingTaskLabels: Record<
  OnboardingTaskKey,
  { label: string; description: string; url: string }
> = {
  payroll: {
    label: "Payroll Setup",
    description:
      "Set pay schedule, pay groups, salary structure, and remittance settings.",
    url: "/dashboard/payroll/checklist",
  },
  staff: {
    label: "Staff Setup",
    description:
      "Add company locations, departments, job roles, and upload employees.",
    url: "/dashboard/employees/checklist", // or your staff-onboarding hub if you have one
  },
};
