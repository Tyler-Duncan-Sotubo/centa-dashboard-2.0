"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import {
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Label,
  LineChart,
  Line,
} from "recharts";

import { formatCurrency } from "@/shared/utils/formatCurrency";
import PageHeader from "@/shared/ui/page-header";

interface PayrollSummaryItem {
  employeeId: string;
  name: string;
  payrollDate: string;
  type: string;
  amount: string;
  taxable: boolean;
}

interface VsRegularData {
  regular: {
    gross: number;
    tax: number;
    net: number;
  };
  offCycle: {
    gross: number;
    tax: number;
    net: number;
  };
  offPercent: number;
}

interface TypeBreakdownItem {
  type: string;
  total: string;
}

interface TaxImpactLine {
  payrollDate: string;
  gross: string;
  pension: string;
  nhf: string;
  paye: string;
  net: string;
  type: string;
}

interface TaxImpact {
  lines: TaxImpactLine[];
  totalRegularTax: string;
}

interface byEmployeeData {
  employeeId: string;
  name: string;
  payrollDate: string;
  type: string;
  amount: string;
  taxable: boolean;
}

interface PayrollDashboardData {
  summary: PayrollSummaryItem[];
  vsRegular: VsRegularData;
  byEmployee: byEmployeeData[];
  typeBreakdown: TypeBreakdownItem[];
  taxImpact: TaxImpact;
}

export default function OffCyclePayrollReport({
  data,
}: {
  data: PayrollDashboardData;
}) {
  const vsRegular = data.vsRegular;
  const summary = data.summary;
  const typeBreakdown = data.typeBreakdown;
  const taxImpact = data.taxImpact;

  const pieChartData = typeBreakdown.map((item, index) => ({
    name: item.type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    value: parseFloat(item.total),
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  const chartConfig = {
    gross: {
      label: "Gross",
      color: "#007A8B", // brand
    },
    net: {
      label: "Net",
      color: "#00626F", // brandDark
    },
    pension: {
      label: "Pension",
      color: "#4BB78F", // monzoGreen
    },
    nhf: {
      label: "NHF",
      color: "#F1BD76", // monzoOrange
    },
    paye: {
      label: "PAYE",
      color: "#FE4B60", // error
    },
  } satisfies Record<string, { label: string; color: string }>;

  return (
    <div className="space-y-6 my-16">
      <PageHeader
        title="Off-Cycle Payroll Report"
        description="View and analyze off-cycle payroll data."
      />

      {/* Summary */}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regular Payroll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-md">
            <p>
              <strong>Gross:</strong> {formatCurrency(vsRegular.regular.gross)}
            </p>
            <p>
              <strong>Tax:</strong> {formatCurrency(vsRegular.regular.tax)}
            </p>
            <p>
              <strong>Net:</strong> {formatCurrency(vsRegular.regular.net)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Off-Cycle Payroll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-md">
            <p>
              <strong>Gross:</strong> {formatCurrency(vsRegular.offCycle.gross)}
            </p>
            <p>
              <strong>Tax:</strong> {formatCurrency(vsRegular.offCycle.tax)}
            </p>
            <p>
              <strong>Net:</strong> {formatCurrency(vsRegular.offCycle.net)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>Off-Cycle %</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Badge variant="completed" className="text-lg p-2">
              {vsRegular.offPercent.toFixed(2)}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Pie Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Off Cycle Type Breakdown</CardTitle>
            <CardDescription>Breakdown of Off-Cycle Types</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[300px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  strokeWidth={10}
                >
                  <Label
                    content={({ viewBox }) => {
                      const total = pieChartData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      );
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
                              className="fill-foreground text-lg font-bold"
                            >
                              {formatCurrency(total)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tax Impact Trend</CardTitle>
            <CardDescription>
              Gross vs Net vs Pension per Payroll Date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="max-h-[300px] w-full"
            >
              <LineChart
                data={taxImpact.lines}
                margin={{ left: 12, right: 12 }}
                accessibilityLayer
                width={500}
                height={100}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="payrollDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  interval={0}
                  tickFormatter={(value) => value.slice(5)} // show day only (MM-DD)
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="net"
                  stroke={chartConfig.net.color}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="pension"
                  stroke={chartConfig.pension.color}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="nhf"
                  stroke={chartConfig.nhf.color}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="paye"
                  stroke={chartConfig.paye.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Off-Cycle Payments Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-md">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Type</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-center">Taxable</th>
                <th className="py-2 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(
                (item: {
                  employeeId: string;
                  name: string;
                  payrollDate: string;
                  type: string;
                  amount: string;
                  taxable: boolean;
                }) => (
                  <tr
                    key={item.employeeId + item.payrollDate}
                    className="border-b last:border-b-0"
                  >
                    <td className="py-4">{item.name}</td>
                    <td className="py-4">{item.type.replace(/_/g, " ")}</td>
                    <td className="py-4 text-right">
                      {formatCurrency(parseFloat(item.amount))}
                    </td>
                    <td className="py-4 text-center">
                      {item.taxable ? "Yes" : "No"}
                    </td>
                    <td className="py-4 text-center">{item.payrollDate}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
