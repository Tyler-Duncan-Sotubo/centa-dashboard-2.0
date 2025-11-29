"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "../ui/button";
import Link from "next/link";

// 🎨 Color config
const chartConfig = {
  present: { label: "Present", color: "#22c55e" },
  absent: { label: "Absent", color: "#ef4444" },
  late: { label: "Late", color: "#eab308" },
} satisfies ChartConfig;

interface AttendanceSummary {
  month: string;
  present: number;
  absent: number;
  late: number;
}

export function AttendanceChart({
  data,
}: {
  data: AttendanceSummary[] | undefined;
}) {
  // 🔄 Convert to percentage
  const percentData = data?.map((entry) => {
    const total = entry.present + entry.absent + entry.late || 1;
    return {
      month: entry.month,
      present: +((entry.present / total) * 100).toFixed(2),
      absent: +((entry.absent / total) * 100).toFixed(2),
      late: +((entry.late / total) * 100).toFixed(2),
    };
  });

  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Monthly Attendance (%)</CardTitle>
        <CardDescription>Track present, absent, and late rates</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 🔍 Filter control */}
        <div className="flex justify-end">
          <Link href={"/dashboard/attendance"}>
            <Button className="text-xs" variant="outline">
              View TimeSheet
            </Button>
          </Link>
        </div>

        {/* 📈 Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={percentData}
              margin={{ top: 8, right: 16, left: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => val.slice(0, 3)}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {["present", "absent", "late"].map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartConfig[key as keyof typeof chartConfig].color}
                  strokeWidth={2}
                  dot={({ cx, cy }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={chartConfig[key as keyof typeof chartConfig].color}
                    />
                  )}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
