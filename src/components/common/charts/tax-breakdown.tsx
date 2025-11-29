"use client";

import { MinusCircle } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PayrollRecord } from "@/types/payroll.type";

const chartConfig = {
  PAYE: {
    label: "PAYE",
  },
  Pension: {
    label: "Pension",
  },
  NHF: {
    label: "NHF",
  },
  Other: {
    label: "Other Deductions",
  },
} satisfies ChartConfig;

export function TaxBreakdown({
  payrollData,
  taxDate,
}: {
  payrollData: PayrollRecord[];
  taxDate: string;
}) {
  const generateChartData = (payrollData: PayrollRecord[]) => {
    return [
      {
        deduction: "PAYE",
        amount: payrollData.reduce((sum, record) => sum + record.PAYE, 0) || 1,
        fill: "#E6614F",
      },
      {
        deduction: "Pension",
        amount:
          payrollData.reduce((sum, record) => sum + record.pension, 0) || 1,
        fill: "#289F91",
      },
      {
        deduction: "NHF",
        amount: payrollData.reduce((sum, record) => sum + record.NHF, 0) || 1,
        fill: "#2C4755",
      },
      {
        deduction: "Others",
        amount: payrollData.reduce(
          (sum, record) => sum + record.additionalDeductions,
          0
        ),
        fill: "#E6C75D",
      },
    ];
  };

  const chartData = payrollData.length ? generateChartData(payrollData) : [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Deductions Summary</CardTitle>
        <CardDescription>{taxDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel className="min-w-[160px]" />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="deduction"
              innerRadius={80}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-md text-center">
        <div className="flex items-center gap-2 font-medium leading-none">
          <MinusCircle className="h-4 w-4" /> Applicable Deductions
        </div>
        <div className="leading-none text-muted-foreground">
          Showing tax breakdown for month of {taxDate}
        </div>
      </CardFooter>
    </Card>
  );
}
