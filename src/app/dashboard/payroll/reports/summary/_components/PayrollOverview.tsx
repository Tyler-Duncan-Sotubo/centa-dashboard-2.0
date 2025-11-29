"use client";

import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { payrollOverview } from "@/types/analytics.type";
import { formatCurrency } from "@/utils/formatCurrency";

const chartConfig = {
  "Payroll Cost": {
    label: "Payroll Cost",
    color: "#4D70FC",
  },
  "Tax Deduction": {
    label: "Tax Deduction",
    color: "#60a5fa",
  },
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
  <div className="flex justify-between items-center text-xs my-2 text-textInverse">
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded ${color}`} />
      <p>{name}</p>
    </div>
    <p>
      <strong>{formatCurrency(cost)}</strong>
    </p>
  </div>
);

type TooltipPayload = {
  dataKey: string;
  value: number;
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload?.length) return null;

  const cost = payload.find((p) => p.dataKey === "Payroll Cost")?.value || 0;
  const deduction =
    payload.find((p) => p.dataKey === "Tax Deduction")?.value || 0;
  const gross = cost - deduction;

  return (
    <div className="bg-textPrimary p-3 rounded-md shadow-md w-[220px]">
      <RenderToolTipUI cost={cost} color="bg-brand/60" name="Payroll Cost" />
      <RenderToolTipUI
        cost={deduction}
        color="bg-slate-500"
        name="Tax Deduction"
      />
      <div className="h-[1px] w-full bg-background my-2" />
      <RenderToolTipUI cost={gross} color="bg-green-500" name="Net Salary" />
    </div>
  );
};

export function PayrollOverview({
  payrollSummary,
  dashboard = false,
}: {
  payrollSummary: payrollOverview[] | undefined;
  dashboard?: boolean;
}) {
  const months = [
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

  const summaryMap: Record<
    string,
    { "Payroll Cost": number; "Tax Deduction": number; "Net Salary": number }
  > = {};

  payrollSummary?.forEach((entry) => {
    const [year, month] = entry.payrollMonth.split("-");
    const monthName = new Date(+year, +month - 1).toLocaleString("en-US", {
      month: "long",
    });

    summaryMap[monthName] = {
      "Payroll Cost": Number(entry.totalPayrollCost),
      "Tax Deduction": Number(entry.totalDeductions),
      "Net Salary": Number(entry.totalNetSalary),
    };
  });

  const data = months.map((month) => ({
    month: month.slice(0, 3),
    "Payroll Cost": summaryMap[month]?.["Payroll Cost"] || 0,
    "Tax Deduction": summaryMap[month]?.["Tax Deduction"] || 0,
    "Net Salary": summaryMap[month]?.["Net Salary"] || 0,
  }));

  const max = Math.max(...data.map((d) => d["Payroll Cost"]));
  const isMillions = max >= 1_000_000;

  const formatTick = (v: number) =>
    isMillions
      ? `₦${(v / 1_000_000).toFixed(1)}m`
      : `₦${(v / 1_000).toFixed(0)}k`;

  return (
    <div
      className={`${
        dashboard ? "md:w-full" : "md:w-[70%]"
      } p-4 rounded-xl shadow-xs border border-background`}
    >
      <div className="mb-6">
        <h3 className="text-xl my-1 font-semibold">Payroll Overview</h3>
        <p className="text-gray-500 text-sm">
          A summary of the payroll cost, tax deductions, and net salaries for
          the year.
        </p>
      </div>
      <ChartContainer config={chartConfig}>
        <BarChart data={data} barSize={25} className="mx-auto">
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatTick} />
          <Tooltip content={<CustomTooltip />} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="Payroll Cost"
            stackId="a"
            fill="hsl(var(--chart-1))"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="Tax Deduction"
            stackId="a"
            fill="hsl(var(--chart-3))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
