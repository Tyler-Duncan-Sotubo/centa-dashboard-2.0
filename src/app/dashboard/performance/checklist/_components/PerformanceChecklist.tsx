"use client";

import React from "react";
import {
  Settings,
  Target,
  MessageSquareMore,
  BadgeCheck,
  ClipboardList,
  Landmark,
  Users,
} from "lucide-react";
import ChecklistCard, { TaskMeta } from "@/components/common/ChecklistCard";
const TASK_META: Record<string, TaskMeta> = {
  performance_general: {
    label: "General Settings",
    description:
      "Set up core performance preferences like cycles and visibility.",
    icon: Settings,
    url: "/dashboard/performance/settings",
    tags: ["extra"],
  },
  goal_policies: {
    label: "Goal Policies",
    description: "Define how goals are created, aligned, and tracked.",
    icon: Target,
    url: "/dashboard/performance/settings/goals-policy",
    tags: ["extra"],
  },
  feedback_settings: {
    label: "Feedback Settings",
    description: "Control rules for peer and manager feedback sharing.",
    icon: MessageSquareMore,
    url: "/dashboard/performance/settings/feedback",
    tags: ["extra"],
  },
  competency: {
    label: "Competency Framework",
    description: "Outline skills and levels to guide employee growth.",
    icon: BadgeCheck,
    url: "/dashboard/performance/settings/competency",
    tags: ["extra"],
  },
  performance_templates: {
    label: "Performance Templates",
    description: "Create review and check-in templates for consistency.",
    icon: ClipboardList,
    url: "/dashboard/performance/settings/templates",
    tags: ["extra"],
  },
  appraisal_framework: {
    label: "Appraisal Framework",
    description: "Set up appraisal cycles, scoring, and calibration rules.",
    icon: Landmark,
    url: "/dashboard/performance/settings/framework",
    tags: ["extra"],
  },
  start_1_1_checkin: {
    label: "Start 1:1 Check-in",
    description: "Launch your first manager–employee one-on-one session.",
    icon: Users,
    url: "/dashboard/performance/reviews",
    tags: ["extra"],
  },
};

export default function PerformanceChecklist() {
  return (
    <ChecklistCard
      title="Performance setup"
      fetchUrl="/api/checklist/performance-progress"
      queryKey={["performance-checklist"]}
      taskMeta={TASK_META}
      showCompleteBanner={false} // no requireds by default
      requireSessionToken
    />
  );
}
