"use client";

import React from "react";
import {
  Settings,
  CalendarClock,
  Layers,
  Building2,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { FaReceipt } from "react-icons/fa6";
import ChecklistCard, { TaskMeta } from "@/shared/ui/checklist-card";

const TASK_META: Record<string, TaskMeta> = {
  pay_schedule: {
    label: "Create pay schedule",
    description: "Choose pay frequency, pay dates, and cut-off rules.",
    icon: CalendarClock,
    url: "/dashboard/payroll/settings/pay-schedules",
  },
  pay_group: {
    label: "Set up pay groups",
    description: "Group employees who share pay cycles and rules.",
    icon: Building2,
    url: "/dashboard/payroll/settings/pay-groups",
  },
  cost_center: {
    label: "Configure cost centers",
    description: "Define where payroll costs are tracked across the business.",
    icon: Layers,
    url: "/dashboard/payroll/settings/cost-centers",
  },
  tax_details: {
    label: "Enter tax details",
    description: "Company tax IDs, registrations, and regional tax settings.",
    icon: FaReceipt,
    url: "/dashboard/payroll/settings",
  },

  salary_structure: {
    label: "Build salary structures",
    description: "Define bands, components, and calculation rules.",
    icon: ShieldCheck,
    url: "/dashboard/payroll/settings",
  },
  // Extras (optional)
  general_settings: {
    label: "Review account settings",
    description:
      "Update the account settings, which affect all users of the account.",
    icon: Settings,
    url: "/dashboard/payroll/settings",
    tags: ["extra"],
  },
  pay_adjustments: {
    label: "Create pay adjustments",
    description:
      "Set up recurring allowances, deductions, and one-off adjustments.",
    icon: Wrench,
    url: "/dashboard/payroll/settings/adjustments",
    tags: ["extra"],
  },
};

export default function PayrollChecklist() {
  return (
    <ChecklistCard
      title="Payroll setup"
      fetchUrl="/api/checklist/payroll-progress"
      queryKey={["payroll-checklist"]}
      taskMeta={TASK_META}
      requireSessionToken
    />
  );
}
