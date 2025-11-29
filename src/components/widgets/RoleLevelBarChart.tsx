"use client";

import * as React from "react";
import { Pie, PieChart, Sector, Label } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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

const fallbackColors = [
  "#007A8B",
  "#a855f7",
  "#ec4899",
  "#eab308",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#14b8a6",
  "#6366f1",
];

type DepartmentData = {
  department: string;
  employees: number;
  fill: string;
  percent: string;
  [key: string]: unknown;
};

// 🔁 Stable hash-based color assignment
function getColorForDepartment(name: string) {
  const hash = Array.from(name).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return fallbackColors[hash % fallbackColors.length];
}

export function EmployeeDepartmentPieChart({
  data,
}: {
  data?: DepartmentData[];
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const total =
    data?.reduce((sum, dept) => sum + Number(dept.employees), 0) || 1;

  const departmentData = data?.map((dept: DepartmentData) => {
    const employees = Number(dept.employees); // 🔁 force numeric

    return {
      ...dept,
      employees,
      fill: getColorForDepartment(dept.department),
      percent: ((employees / total) * 100).toFixed(1),
    };
  });

  const chartConfig = {
    brand: { label: "Engineering", color: "hsl(var(--color-brand))" },
    purple: { label: "Marketing", color: "hsl(var(--color-purple))" },
    pink: { label: "Sales", color: "hsl(var(--color-pink))" },
    yellow: { label: "HR", color: "hsl(var(--color-yellow))" },
    green: { label: "Support", color: "hsl(var(--color-green))" },
    red: { label: "Legal", color: "hsl(var(--color-red))" },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col pb-4">
      <CardHeader className="pb-0">
        <CardTitle>Employees by Department</CardTitle>
        <CardDescription>Headcount distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={departmentData}
              dataKey="employees"
              nameKey="department"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
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
                          {departmentData?.[activeIndex]?.employees ?? 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Employees
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        {/* 🧭 Legend */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 mt-6 text-sm w-full max-w-xs">
          {departmentData?.map((dept: DepartmentData) => (
            <div key={dept.department} className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: dept.fill }}
              />
              <span className="flex-1 truncate">{dept.department}</span>
              <span className="tabular-nums text-muted-foreground">
                {dept.percent}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
