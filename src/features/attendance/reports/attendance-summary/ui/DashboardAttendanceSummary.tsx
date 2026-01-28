"use client";

import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { cn } from "@/lib/utils";

interface DashboardData {
  sevenDayTrend: number[];
  wtdAttendanceRate: string;
  overtimeThisMonth: string;
  topLateArrivals: string[];
  departmentRates: { department: string; rate: string }[];
  rolling30DayAbsenteeismRate: string;
}

interface Props {
  dashboard: DashboardData;
}

export function DashboardAttendanceSummary({ dashboard }: Props) {
  const trendData = dashboard?.sevenDayTrend.map((value, index) => ({
    day: `D${index + 1}`,
    attendance: value,
  }));

  return (
    <div className="grid gap-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
        <StatCard
          title="WTD Attendance Rate"
          value={dashboard?.wtdAttendanceRate}
        />
        <StatCard
          title="Overtime This Month"
          value={dashboard?.overtimeThisMonth}
        />
        <StatCard
          title="30-Day Absenteeism"
          value={dashboard?.rolling30DayAbsenteeismRate}
          variant="destructive"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Line Chart */}
        <Card className="shadow-lg rounded-lg bg-white">
          <CardHeader>
            <CardTitle>7-Day Attendance Trend</CardTitle>
            <CardDescription>Daily attendance counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Late Arrivals */}
        <Card className="shadow-lg rounded-lg bg-white">
          <CardHeader>
            <CardTitle>Top Late Arrivals</CardTitle>
            <CardDescription>Most frequent offenders this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard?.topLateArrivals.length ? (
              dashboard?.topLateArrivals.map((person, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  {person}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No late arrivals
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Attendance Rates */}
        <Card className="shadow-lg rounded-lg bg-white">
          <CardHeader>
            <CardTitle>Department Attendance Rates</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard?.departmentRates.map((dept, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{dept.department}</span>
                <span className="font-medium">{dept.rate}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility card component
function StatCard({
  title,
  value,
  variant = "default",
}: {
  title: string;
  value: string;
  variant?: "default" | "destructive";
}) {
  return (
    <div
      className={cn(
        "border-2 px-4 py-6 space-y-3 shadow-lg rounded-lg bg-white",
        variant === "destructive" && "border-destructive text-destructive",
      )}
    >
      <div className="pb-2">
        <p className="font-semibold">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        <TrendingUp className="mr-1 h-4 w-4 inline-block" />
        Compared to last week
      </p>
    </div>
  );
}
