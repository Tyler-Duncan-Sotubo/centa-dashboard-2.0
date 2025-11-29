"use client";

import React, { useMemo } from "react";

import type { TooltipProps } from "recharts";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";

// Data types from API
interface MonthlySummary {
  year: string;
  month: string;
  status: string;
  totalLoanAmount: string;
  totalRepaid: string;
  totalOutstanding: string;
}

// Props for component
export function LoanMonthlySummaryChart({ data }: { data: MonthlySummary[] }) {
  // Build full 12 months even if data missing
  const fullYear = new Date().getFullYear();
  const allMonths = Array.from({ length: 6 }, (_, i) => i + 1);

  const mappedData = useMemo(() => {
    const map: Record<string, MonthlySummary> = {};
    data.forEach((item) => {
      map[`${item.year}-${item.month}`] = item;
    });

    return allMonths.map((monthNum) => {
      const key = `${fullYear}-${monthNum}`;
      const record = map[key];
      return {
        month: new Date(fullYear, monthNum - 1).toLocaleString("default", {
          month: "short",
        }),
        totalLoan: parseFloat(record?.totalLoanAmount ?? "0"),
        totalRepaid: parseFloat(record?.totalRepaid ?? "0"),
        outstanding: parseFloat(record?.totalOutstanding ?? "0"),
      };
    });
  }, [allMonths, data, fullYear]);

  const chartConfig = {
    totalLoan: { label: "Loan Issued", color: "#4D70FC" },
    totalRepaid: { label: "Repaid", color: "#10b981" },
    outstanding: { label: "Outstanding", color: "#ef4444" },
  } satisfies ChartConfig;

  const max = Math.max(...mappedData.map((d) => d.totalLoan + d.totalRepaid));
  const isMillions = max >= 1_000_000;
  const formatTick = (v: number) =>
    isMillions
      ? `₦${(v / 1_000_000).toFixed(1)}m`
      : `₦${(v / 1_000).toFixed(0)}k`;

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 rounded-md shadow-md w-[220px]">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex justify-between items-center text-xs my-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p>
                {chartConfig[entry.dataKey as keyof typeof chartConfig].label}
              </p>
            </div>
            <p>
              <strong>{formatCurrency(entry.value ?? 0)}</strong>
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Loan Monthly Summary</CardTitle>
        <CardDescription>Full year breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={mappedData} barSize={40}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatTick} />
            <Tooltip content={<CustomTooltip />} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="totalLoan"
              fill={chartConfig.totalLoan.color}
              radius={4}
            />

            <Bar
              dataKey="outstanding"
              fill={chartConfig.outstanding.color}
              radius={4}
            />
            <Bar
              dataKey="totalRepaid"
              fill={chartConfig.totalRepaid.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
