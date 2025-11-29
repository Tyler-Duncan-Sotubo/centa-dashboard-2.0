"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatCurrency";
import { Pie, PieChart } from "recharts";

// Define all salary ranges (even if not in data)
const salaryRanges = [
  "Below 50K",
  "50K - 100K",
  "100K - 200K",
  "200K - 500K",
  "500K - 1M",
  "Above 1M",
];

export function DepartmentDistribution({
  spendByDepartment,
}: {
  spendByDepartment: { totalNetSalary: string; departmentName: string }[];
}) {
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
  } satisfies ChartConfig;

  // Predefined colors from your theme
  const chartColors = [
    "hsl(227, 56%, 52%)", // --chart-1
    "hsl(205, 34%, 47%)", // --chart-2
    "hsl(197, 37%, 24%)", // --chart-3
    "hsl(34, 72%, 60%)", // --chart-4
    "hsl(350, 38%, 48%)", // --chart-5
  ];

  // Convert API data to chart format
  const chartData = spendByDepartment.map((dept, index) => ({
    department: dept.departmentName.trim(),
    salary: Number(parseFloat(dept.totalNetSalary) / 100),
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h3 className="text-xl my-1 font-semibold">
          Payroll Distribution by Department
        </h3>
        <p className="text-gray-500 text-sm">
          Distribution of payroll by department
        </p>
      </div>
      <div className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="salary"
              label={({ name }) => name}
              nameKey="department"
              fill="fill" // Assign dynamic colors
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function SalaryDistribution({
  salaryStats,
  salaryDistribution,
  spendByDepartment,
}: {
  salaryStats: {
    avgSalary: number;
    highestPaid: number;
    lowestPaid: number;
  };
  salaryDistribution: { salaryRange: string; count: number }[];
  spendByDepartment: { totalNetSalary: string; departmentName: string }[];
}) {
  const chartConfig = {
    employees: {
      label: "Employees",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Map data and ensure all ranges are included
  const formattedData = salaryRanges.map((range) => ({
    salaryRange: range,
    employees:
      salaryDistribution.find((entry) => entry.salaryRange === range)?.count ||
      0, // Default to 0 if not found
  }));

  return (
    <section className="md:flex py-10 md:space-x-6 w-full">
      {/* Salary Distribution Chart */}
      <div className="md:w-[60%] p-4 rounded-xl shadow-xs border border-background">
        <div className="mb-6">
          <h3 className="text-xl my-1 font-semibold">Salary Distribution </h3>
          <p className="text-gray-500 text-sm">
            Distribution of employees by salary range
          </p>
        </div>
        <ChartContainer config={chartConfig} className="">
          <BarChart data={formattedData} barGap={10}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="salaryRange" tickMargin={10} className="text-xs" />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="employees" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Salary Stats */}
      <section className="md:w-[40%] mt-6 md:mt-0 flex justify-center flex-col items-center p-4 rounded-xl shadow-xs border border-background">
        <DepartmentDistribution spendByDepartment={spendByDepartment} />
        <div className="space-y-2 w-full">
          <h3 className="text-xl my-4 font-semibold">Salary Stats</h3>
          <p className="font-semibold text-lg flex justify-between border-b pb-2">
            <span className="font-medium text-md">Average Salary:</span>{" "}
            {formatCurrency(salaryStats.avgSalary)}
          </p>
          <p className="font-semibold text-lg flex justify-between border-b pb-2">
            <span className="font-medium text-md">Highest Paid:</span>{" "}
            {formatCurrency(salaryStats.highestPaid)}
          </p>
          <p className="font-semibold text-lg flex justify-between ">
            <span className="font-medium text-md">Lowest Paid:</span>{" "}
            {formatCurrency(salaryStats.lowestPaid)}
          </p>
        </div>
      </section>
    </section>
  );
}
