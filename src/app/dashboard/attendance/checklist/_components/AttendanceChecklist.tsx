"use client";

import ChecklistCard, { TaskMeta } from "@/components/common/ChecklistCard";
import { Settings, CalendarRange, CalendarCheck2, MapPin } from "lucide-react";

export default function AttendanceChecklist() {
  const ATTENDANCE_TASK_META: Record<string, TaskMeta> = {
    attendance_setting: {
      label: "General Settings",
      // put the requested fields "in words"
      description:
        "Configure use of shifts, default start/end times and working days, late tolerance and early clock-in window, public-holiday blocking, overtime and half-day options, plus half-day duration.",
      icon: Settings,
      url: "/dashboard/attendance/settings",
      tags: ["extra"],
    },
    shift_management: {
      label: "Shift Management",
      description: "Create and manage shift patterns and rules.",
      icon: CalendarRange,
      url: "/dashboard/attendance/settings/shift-management",
      tags: ["extra"],
    },
    assign_rota: {
      label: "Assign Rota",
      description: "Schedule employees to shifts and publish rotas.",
      icon: CalendarCheck2,
      url: "/dashboard/attendance/rota-shifts",
      tags: ["extra"],
    },
    add_office_location: {
      label: "Office Locations",
      description: "Add work sites for attendance and rota planning.",
      icon: MapPin,
      url: "/dashboard/attendance",
      tags: ["extra"],
    },
  };

  return (
    <ChecklistCard
      title="Attendance setup"
      fetchUrl="/api/checklist/attendance-progress"
      queryKey={["attendance-checklist"]}
      taskMeta={ATTENDANCE_TASK_META}
      showCompleteBanner={false}
      requireSessionToken
    />
  );
}
