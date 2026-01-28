"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CalendarCheck, Clock, CalendarX } from "lucide-react";
import { FiCalendar } from "react-icons/fi";
import type { AttendanceRecord } from "../types/employee-attendance.types";

type Props = { records: AttendanceRecord[] };

export function AttendanceSummary({ records }: Props) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;

  const items = [
    {
      label: "Total",
      value: total,
      icon: <FiCalendar className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Present",
      value: present,
      icon: <CalendarCheck className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Late",
      value: late,
      icon: <Clock className="text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Absent",
      value: absent,
      icon: <CalendarX className="text-red-600" />,
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className={item.bg}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
