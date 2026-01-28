"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/shared/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";

const chartConfig = {
  present: {
    label: "Present",
    color: "#4BB78F", // monzoGreen
  },
  absent: {
    label: "Absent",
    color: "#FE4B60", // error
  },
} satisfies ChartConfig;

type DepartmentSummary = Record<
  string,
  {
    present: number;
    absent: number;
    total: number;
  }
>;

interface Props {
  departmentSummary: DepartmentSummary;
}

export function DepartmentAttendanceBarChart({ departmentSummary }: Props) {
  const chartData = React.useMemo(() => {
    const summary = departmentSummary || {};
    return Object.entries(summary).map(([dept, values]) => ({
      department: dept,
      present: values.present,
      absent: values.absent,
    }));
  }, [departmentSummary]);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Summary of Present vs Absent</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              barCategoryGap={20}
              margin={{ bottom: 60 }} // Increased to avoid cutoff
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="department"
                tickLine={false}
                tickMargin={10}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tickLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="present"
                fill={chartConfig.present.color}
                radius={4}
              />
              <Bar
                dataKey="absent"
                fill={chartConfig.absent.color}
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
