"use client";

import React, { useMemo } from "react";
import { Pie, PieChart, Label, Cell } from "recharts";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DepartmentUsageProps {
  data: { departmentName: string; totalLeaveDays: string }[];
}

const pieColors = [
  "#007A8B", // brand
  "#00626F", // brandDark
  "#047857", // success
  "#4BB78F", // monzoGreen
  "#F1BD76", // monzoOrange
  "#FFB54D", // secondary
  "#FE4B60", // error
];

export function DepartmentUsageChart({ data }: DepartmentUsageProps) {
  const chartData = data.map((item, index) => ({
    departmentName: item.departmentName,
    totalDays: parseFloat(item.totalLeaveDays),
    fill: pieColors[index % pieColors.length], // cycle colors if data exceeds palette size
  }));

  const chartConfig = {
    totalDays: { label: "Leave Days" },
  } satisfies ChartConfig;

  const total = useMemo(
    () => chartData.reduce((acc, item) => acc + item.totalDays, 0),
    [chartData]
  );

  return (
    <Card className="flex space-x-4 px-5 h-[400px] max-w-4xl">
      {/* Pie Chart */}
      <section className="flex-1 flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Department Usage</CardTitle>
          <CardDescription>Leave Distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="totalDays"
                nameKey="departmentName"
                innerRadius={60}
                strokeWidth={5}
                isAnimationActive={false} // (optional: disables animation for better dev feedback)
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toFixed(2)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Days
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
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
                <TableHead>Department</TableHead>
                <TableHead>Total Leave Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.departmentName}</TableCell>
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
