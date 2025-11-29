// components/Bars.tsx
"use client";

import React from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

type TooltipPayload = {
  dataKey: string;
  value: number;
};
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { RunSummary } from "@/types/payroll.type";
import { formatCurrency } from "@/utils/formatCurrency";

const chartConfig = {
  "Gross Salary": { label: "Gross Salary", color: "#4D70FC" },
  "Tax Deduction": { label: "Tax Deduction", color: "#60a5fa" },
} satisfies ChartConfig;

const RenderToolTipUI = ({
  cost,
  color,
  name,
}: {
  cost: number;
  color: string;
  name: string;
}) => (
  <div className="flex justify-between items-center text-xs text-textInverse my-1">
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded ${color}`} />
      <p>{name}</p>
    </div>
    <p>
      <strong>{formatCurrency(cost)}</strong>
    </p>
  </div>
);

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload?.length) return null;

  const gross = payload.find((x) => x.dataKey === "Gross Salary")?.value || 0;
  const deduction =
    payload.find((x) => x.dataKey === "Tax Deduction")?.value || 0;
  const net = gross - deduction;

  return (
    <div className="bg-textPrimary p-3 rounded-md shadow-md w-56">
      <RenderToolTipUI cost={gross} color="bg-brand/60" name="Gross Salary" />
      <RenderToolTipUI
        cost={deduction}
        color="bg-teal-600"
        name="Tax Deduction"
      />
      <div className="h-px bg-background my-2" />
      <RenderToolTipUI cost={net} color="bg-green-500" name="Net Salary" />
    </div>
  );
};

export function Bars({
  runSummaries,
}: {
  runSummaries: RunSummary[] | undefined;
}) {
  // Full month list
  const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Build lookup by month name
  const mapByMonth: Record<string, { gross: number; ded: number }> = {};
  runSummaries?.forEach((run) => {
    const [y, m] = run.payrollMonth.split("-");
    const monthName = new Date(+y, +m - 1).toLocaleString("en-US", {
      month: "long",
    });
    mapByMonth[monthName] = {
      gross: Number(run.totalGross),
      ded: Number(run.totalDeductions),
    };
  });

  // Prepare chart data: one entry per calendar month
  const data = allMonths.map((month) => ({
    month: month.slice(0, 3), // short label
    "Gross Salary": mapByMonth[month]?.gross || 0,
    "Tax Deduction": mapByMonth[month]?.ded || 0,
  }));

  // Determine top value to format axis
  const maxVal = Math.max(
    ...data.map((d) => d["Gross Salary"] + d["Tax Deduction"])
  );

  const isMillions = maxVal >= 1_000_000;
  const formatTick = (v: number) =>
    isMillions
      ? `₦${(v / 1_000_000).toFixed(1)}m`
      : `₦${Math.round(v / 1_000)}K`;

  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data} barSize={20} className="mx-auto">
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} tickFormatter={formatTick} />
        <Tooltip content={<CustomTooltip />} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="Gross Salary"
          stackId="a"
          fill="hsl(var(--chart-1))"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="Tax Deduction"
          stackId="a"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

export default Bars;
