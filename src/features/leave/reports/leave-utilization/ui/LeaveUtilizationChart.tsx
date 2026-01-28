"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface LeaveUtilizationProps {
  data: { leaveType: string; totalLeaveDays: string }[];
}

export function LeaveUtilizationChart({ data }: LeaveUtilizationProps) {
  const chartData = data.map((item) => ({
    leaveType: item.leaveType,
    totalDays: parseFloat(item.totalLeaveDays),
  }));

  const chartConfig = {
    totalDays: {
      label: "Leave Days",
      color: "#001E3A",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex space-x-4 px-5 max-w-4xl">
      {/* Chart Card */}
      <section className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Leave Utilization</CardTitle>
          <CardDescription>By Leave Type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ChartContainer config={chartConfig} className="max-h-87.5">
            <BarChart width={400} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="leaveType"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="totalDays" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </section>

      {/* Table */}
      <section className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Total Leave Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.leaveType}</TableCell>
                  <TableCell>{row.totalLeaveDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </section>
    </Card>
  );
}
