"use client";

import React from "react";
import ChecklistCard, { TaskMeta } from "@/shared/ui/checklist-card";
import {
  FaBriefcase,
  FaClipboardCheck,
  FaProjectDiagram,
} from "react-icons/fa";
import { MdEmail, MdWorkOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

const TASK_META: Record<string, TaskMeta> = {
  pipeline: {
    label: "Hiring Pipeline",
    description: "Set up stages to manage candidate progress.",
    icon: FaProjectDiagram, // pick a Lucide icon
    url: "/dashboard/recruitment/pipelines",
    tags: ["extra"],
  },
  scorecards: {
    label: "Scorecards",
    description: "Standardize how interviewers evaluate candidates.",
    icon: FaClipboardCheck,
    url: "/dashboard/recruitment/scorecards",
    tags: ["extra"],
  },
  email_templates: {
    label: "Email Templates",
    description: "Save reusable messages for candidate communication.",
    icon: MdEmail,
    url: "/dashboard/recruitment/email-templates",
    tags: ["extra"],
  },
  offer_templates: {
    label: "Offer Templates",
    description: "Create offer letter templates for faster hiring.",
    icon: MdWorkOutline,
    url: "/dashboard/recruitment/offer-templates",
    tags: ["extra"],
  },
  create_jobs: {
    label: "Create Jobs",
    description: "Post new job openings and start accepting candidates.",
    icon: FaBriefcase,
    url: "/dashboard/recruitment/jobs/create",
    tags: ["extra"],
  },
  google_integration: {
    label: "Google Integration",
    description: "Sync calendar and contacts with Google.",
    icon: FcGoogle,
    url: "/dashboard/integrations",
    tags: ["extra"],
  },
};

export default function HiringChecklist() {
  return (
    <ChecklistCard
      title="Hiring setup"
      fetchUrl="/api/checklist/hiring-progress"
      queryKey={["hiring-checklist"]}
      taskMeta={TASK_META}
      showCompleteBanner={false} // no requireds by default
      requireSessionToken
    />
  );
}
