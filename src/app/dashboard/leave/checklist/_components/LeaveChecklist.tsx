// app/(dashboard)/leave/_components/LeaveChecklist.tsx
"use client";

import ChecklistCard, { TaskMeta } from "@/components/common/ChecklistCard";
import {
  FaCogs,
  FaClipboardList,
  FaUmbrellaBeach,
  FaBan,
  FaLock,
} from "react-icons/fa";

export default function LeaveChecklist() {
  const LEAVE_TASK_META: Record<string, TaskMeta> = {
    leave_settings: {
      label: "Leave Settings",
      description: "Configure global time-off rules and defaults.",
      icon: FaCogs,
      url: "/dashboard/leave/settings",
      tags: ["extra"],
    },
    leave_types_policies: {
      label: "Leave Types & Policies",
      description: "Define leave categories and entitlement rules.",
      icon: FaClipboardList,
      url: "/dashboard/leave/settings/types-policies",
      tags: ["extra"],
    },
    holidays: {
      label: "Holidays",
      description: "Add public holidays for your locations.",
      icon: FaUmbrellaBeach,
      url: "/dashboard/leave/settings/holidays",
      tags: ["extra"],
    },
    blocked_days: {
      label: "Blocked Days",
      description: "Prevent time off on critical dates.",
      icon: FaBan,
      url: "/dashboard/leave/settings/blocked-days",
      tags: ["extra"],
    },
    reserved_days: {
      label: "Reserved Days",
      description: "Ring-fence days for special use.",
      icon: FaLock,
      url: "/dashboard/leave/settings/reserved-days",
      tags: ["extra"],
    },
  };
  return (
    <ChecklistCard
      title="Time Off setup"
      fetchUrl="/api/checklist/leave-progress"
      queryKey={["leave-checklist"]}
      taskMeta={LEAVE_TASK_META}
      showCompleteBanner={false}
      requireSessionToken
    />
  );
}
