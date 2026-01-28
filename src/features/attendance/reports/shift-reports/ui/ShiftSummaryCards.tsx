"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { MonthlySummary } from "@/types/shift.type";
import { CalendarDays, Users, LayoutGrid } from "lucide-react";

export function ShiftSummaryCards({ summary }: { summary: MonthlySummary }) {
  const items = [
    {
      label: "Total Shifts",
      value: summary?.totalShifts,
      icon: <CalendarDays className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Unique Employees",
      value: summary?.uniqueEmployees,
      icon: <Users className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Shift Types",
      value: summary?.uniqueShiftTypes,
      icon: <LayoutGrid className="w-5 h-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
      {items.map((item, i) => (
        <Card key={i}>
          <CardContent className="px-5 py-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-md text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
            {item.icon}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
