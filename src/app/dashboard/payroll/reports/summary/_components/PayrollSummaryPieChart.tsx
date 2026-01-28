"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import { formatDate } from "date-fns";
import { payrollOverview } from "@/types/analytics.type";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function PayrollSummaryPieChart({
  payrollSummary,
  dashboard = false,
}: {
  payrollSummary: payrollOverview[] | undefined;
  dashboard?: boolean;
}) {
  const latestPayroll = payrollSummary?.[0] as payrollOverview;
  const previousPayroll = payrollSummary?.[1] as payrollOverview;

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
    return ((current - previous) / previous) * 100;
  };

  const netSalaryGrowth = calculateGrowth(
    Number(latestPayroll?.totalNetSalary),
    Number(previousPayroll?.totalNetSalary),
  );

  const grossSalaryGrowth = calculateGrowth(
    Number(latestPayroll?.totalPayrollCost),
    Number(previousPayroll?.totalPayrollCost),
  );

  const deductionGrowth = calculateGrowth(
    Number(latestPayroll?.totalDeductions),
    Number(previousPayroll?.totalDeductions),
  );

  // Transform the payroll data into a format suitable for the pie chart
  const chartData = [
    {
      category: "Net Salary",
      value: Number(latestPayroll?.totalNetSalary), // ✅ Convert to number
      fill: "hsl(var(--chart-2))",
    },
    {
      category: "Payroll Cost",
      value: Number(latestPayroll?.totalPayrollCost), // ✅ Convert to number
      fill: "hsl(var(--chart-3))",
    },
    {
      category: "Deduction",
      value: Number(latestPayroll?.totalDeductions), // ✅ Convert to number
      fill: "hsl(var(--chart-1))",
    },
  ];

  const chartConfig = {
    grossSalary: {
      label: "Payroll Cost",
      color: "hsl(var(--chart-1))",
    },
    netSalary: {
      label: "Net Salary",
      color: "hsl(var(--chart-2))",
    },
    totalDeduction: {
      label: "Deduction",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  function GrowthIndicator({ value }: { value: number }) {
    const isValid = Number.isFinite(value);
    const displayValue = isValid ? value : 0;

    return (
      <div className="flex items-center gap-1 text-sm font-semibold">
        {displayValue > 0 ? (
          <ArrowUp className="text-success h-4 w-4" />
        ) : displayValue < 0 ? (
          <ArrowDown className="text-error h-4 w-4" />
        ) : (
          <Minus className="text-gray-500 h-4 w-4" />
        )}
        <span
          className={
            displayValue > 0
              ? "text-success"
              : displayValue < 0
                ? "text-error"
                : "text-gray-500"
          }
        >
          {displayValue.toFixed(2)}%
        </span>
      </div>
    );
  }

  const SideDetails = ({
    color,
    name,
    figure,
  }: {
    color: string;
    name: string;
    figure: number | string;
  }) => {
    return (
      <div className="flex items-center justify-between gap-2">
        <div
          style={{
            backgroundColor: `hsl(var(--chart-${color}))`,
          }}
          className="h-8 w-1 rounded-lg"
        />
        <p className="flex-1">{name}</p>
        <div className="flex flex-1 items-center gap-2 font-semibold">
          {name === "Net Salary" ? (
            <GrowthIndicator value={netSalaryGrowth} />
          ) : name === "Payroll Cost" ? (
            <GrowthIndicator value={grossSalaryGrowth} />
          ) : name === "Deduction" ? (
            <GrowthIndicator value={deductionGrowth} />
          ) : null}
          <br />
          <p className="text-md">
            {typeof figure === "undefined"
              ? "00.00"
              : formatCurrency(Number(figure))}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`${
        dashboard ? "w-full" : "md:w-[30%]"
      } flex flex-col justify-between first-letter:shadow-none p-4 rounded-xl shadow-2xs border border-background mt-6 md:mt-0`}
    >
      <div>
        <div className="flex items-center justify-between w-full mb-2">
          <p className="text-lg font-semibold ">Latest Payroll</p>
          <p>{latestPayroll?.employeeCount} employees</p>
        </div>
        <p className="text-gray-500 text-sm">
          Payroll summary for the month of{" "}
          {latestPayroll?.payrollMonth
            ? formatDate(new Date(latestPayroll?.payrollMonth), "MMMM yyyy")
            : "N/A"}
        </p>
      </div>

      <div className="w-full pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              innerRadius={70}
              strokeWidth={5}
              activeIndex={0}
            >
              <Label
                position="center"
                fontSize={14}
                fontWeight={700}
                value={`${
                  latestPayroll?.payrollMonth &&
                  formatDate(
                    new Date(latestPayroll?.payrollMonth || ""),
                    "MMMM yyyy",
                  )
                }`}
                fill="var(--color-text)"
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-4 w-full text-sm justify-between">
        <div className="flex flex-col gap-4">
          <SideDetails
            color="2"
            name="Net Salary"
            figure={latestPayroll?.totalNetSalary}
          />
          <SideDetails
            color="1"
            name="Deduction"
            figure={latestPayroll?.totalDeductions}
          />
          <SideDetails
            color="3"
            name="Payroll Cost"
            figure={latestPayroll?.totalPayrollCost}
          />
        </div>
      </div>
    </section>
  );
}
