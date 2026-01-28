"use client";

import React from "react";
import {
  BriefcaseBusiness,
  MapPin,
  UploadCloud,
  ClipboardList,
  DoorOpen,
} from "lucide-react";
import ChecklistCard, { TaskMeta } from "@/shared/ui/checklist-card";
import { FaSitemap } from "react-icons/fa";

const TASK_META: Record<string, TaskMeta> = {
  job_roles: {
    label: "Create job roles",
    description: "Standardize titles and responsibilities across the org.",
    icon: BriefcaseBusiness,
    url: "/dashboard/company/job-roles",
  },
  departments: {
    label: "Set up departments",
    description: "Organize teams for reporting and approvals.",
    icon: FaSitemap,
    url: "/dashboard/company/departments",
  },
  company_locations: {
    label: "Add company locations",
    description: "Define offices/sites that employees belong to.",
    icon: MapPin,
    url: "/dashboard/company/offices",
  },
  upload_employees: {
    label: "Upload employees",
    description: "Import your people via CSV or connect your HRIS.",
    icon: UploadCloud,
    url: "/dashboard/employees",
  },
  onboarding_templates: {
    label: "Create onboarding templates",
    description: "Task lists and documents for smooth new-hire onboarding.",
    icon: ClipboardList,
    url: "/dashboard/employees/onboarding-templates",
    tags: ["extra"], // click will mark done immediately
  },
  offboarding_process: {
    label: "Define offboarding process",
    description: "Checklist and steps to ensure clean exits.",
    icon: DoorOpen,
    url: "/dashboard/employees/offboarding-process",
    tags: ["extra"], // click will mark done immediately
  },
};

export default function StaffChecklist() {
  return (
    <ChecklistCard
      title="Staff setup"
      fetchUrl="/api/checklist/staff-progress"
      queryKey={["staff-checklist"]}
      taskMeta={TASK_META}
      showCompleteBanner
      requireSessionToken
    />
  );
}
