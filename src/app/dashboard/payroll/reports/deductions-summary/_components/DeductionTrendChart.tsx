"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DeductionBreakdownItem,
  EmployerCostBreakdownItem,
} from "@/types/deduction.type";
import { formatCurrency } from "@/utils/formatCurrency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type PayrollChartData = {
  month: string;
  paye?: number;
  pension?: number;
  nhf?: number;
  custom?: number;
  gross?: number;
  employerPension?: number;
  totalCost?: number;
};

const LABEL_MAP: Record<string, string> = {
  paye: "PAYE",
  pension: "Employee Pension",
  nhf: "NHF",
  custom: "Voluntary Deductions",
  gross: "Gross Salary",
  employerPension: "Employer Pension",
  totalCost: "Total Cost",
};

function mergePayrollChartData({
  deductionBreakdown,
  employerCostBreakdown,
}: {
  deductionBreakdown: DeductionBreakdownItem[];
  employerCostBreakdown: EmployerCostBreakdownItem[];
}): PayrollChartData[] {
  const merged: Record<string, PayrollChartData> = {};

  deductionBreakdown.forEach((d) => {
    merged[d.payrollMonth] = {
      month: d.payrollMonth,
      paye: Number(d.paye),
      pension: Number(d.pension),
      nhf: Number(d.nhf),
      custom: Number(d.custom),
    };
  });

  employerCostBreakdown.forEach((e) => {
    const entry = merged[e.payrollMonth] || { month: e.payrollMonth };
    entry.gross = Number(e.gross);
    entry.employerPension = Number(e.employerPension);
    entry.totalCost = Number(e.totalCost);
    merged[e.payrollMonth] = entry;
  });

  return Object.values(merged).sort((a, b) => a.month.localeCompare(b.month));
}

export function DeductionTrendChart({
  deductionBreakdown,
  employerCostBreakdown,
}: {
  deductionBreakdown: DeductionBreakdownItem[];
  employerCostBreakdown: EmployerCostBreakdownItem[];
}) {
  const data = mergePayrollChartData({
    deductionBreakdown,
    employerCostBreakdown,
  });

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border rounded-md p-3 shadow-md text-sm">
        <p className="font-semibold mb-2">Month: {label}</p>
        {payload.map((entry, index: number) => {
          const name = LABEL_MAP[entry.dataKey as string] ?? entry.dataKey;
          return (
            <div key={index} className="flex justify-between gap-4">
              <span>{name}</span>
              <span>{formatCurrency(entry.value as number)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="mt-10">
      <CardHeader className="text-lg font-semibold">Payroll Trends</CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}m`}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="natural"
              dataKey="paye"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="natural"
              dataKey="pension"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
            <Area
              type="natural"
              dataKey="nhf"
              stackId="2"
              stroke="#ffc658"
              fill="#ffc658"
            />
            <Area
              type="natural"
              dataKey="custom"
              stackId="2"
              stroke="#ff7300"
              fill="#ff7300"
            />
            <Area
              type="natural"
              dataKey="employerPension"
              stackId="2"
              stroke="#00C49F"
              fill="#00C49F"
            />
            <Area
              type="natural"
              dataKey="gross"
              stackId="2"
              stroke="#0088FE"
              fill="#0088FE"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
