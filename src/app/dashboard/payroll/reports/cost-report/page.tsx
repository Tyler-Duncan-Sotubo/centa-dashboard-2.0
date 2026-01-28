"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  LabelList,
  Cell,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { ExportMenu } from "@/shared/ui/export-menu";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const chartColors = [
  "#007A8B", // brand
  "#FE4B60", // error
  "#4BB78F", // monzoGreen
  "#F1BD76", // monzoOrange
  "#047857", // success
  "#FFB54D", // secondary
  "#00626F", // brandDark
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

export default function PayrollCostReport() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;

  const fetchPayrollCost = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/payroll-report/payroll-cost?month=${yearMonth}`,
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payroll-cost-report", yearMonth],
    queryFn: fetchPayrollCost,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  interface DepartmentCost {
    departmentName: string;
    totalGross: string | number;
  }

  interface PayGroupCost {
    payGroupName: string;
    totalGross: string | number;
    totalNet?: string | number;
  }

  interface PayrollCostData {
    departmentCost: DepartmentCost[];
    payGroupCost: PayGroupCost[];
  }

  const departmentChartData = (data as PayrollCostData).departmentCost.map(
    (dept: DepartmentCost, i: number) => ({
      name: dept.departmentName,
      value: parseFloat(dept.totalGross as string),
      fill: chartColors[i % chartColors.length],
    }),
  );

  interface PayGroupChartData {
    name: string;
    totalGross: number;
  }
  const payGroupChartData: PayGroupChartData[] = (
    data as PayrollCostData
  ).payGroupCost.map((item: PayGroupCost) => ({
    name: item.payGroupName,
    totalGross: Number(item.totalGross),
    totalNet: Number(item.totalNet ?? 0),
  }));

  const payGroupChartConfig = {
    totalGross: {
      label: "Gross Salary",
      color: "#007A8B", // brand
    },
    totalNet: {
      label: "Net Salary",
      color: "#4BB78F", // monzoGreen
    },
  } satisfies ChartConfig;

  const departmentChartConfig = {
    value: {
      label: "Department Cost",
      color: "hsl(var(--chart-2))",
    },
  };

  const YearSelector = () => {
    return (
      <div className="flex gap-2">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {format(new Date(`${year}-${m}-01`), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <section className="px-5">
      <PageHeader
        title="Payroll Cost Report"
        description="View and export payroll cost reports for your company and employees."
      />
      {/* Year and Month Selector */}
      <div className="flex justify-end mb-10 gap-4">
        {YearSelector()}{" "}
        <ExportMenu
          exportPath="/api/payroll-report/gen-cost-by-department"
          query={{
            month: yearMonth,
          }}
        />
      </div>
      <div className="space-y-10">
        {/* 🔶 Bar Chart for Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll by Department</CardTitle>
            <CardDescription>Current Payroll Cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={departmentChartConfig}>
              <BarChart
                data={departmentChartData}
                margin={{ top: 20 }}
                height={300}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={8}>
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={10}
                    formatter={(v: number) => `₦${v.toLocaleString()}`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* 🔵 Pie Chart for Pay Group */}

        <div className="flex justify-end">
          <ExportMenu
            exportPath="/api/payroll-report/gen-cost-by-paygroup"
            query={{
              month: yearMonth,
            }}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pay Group Cost Breakdown</CardTitle>
            <CardDescription>Month: {month}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={payGroupChartConfig}
              className="h-full w-full"
            >
              <BarChart
                data={payGroupChartData}
                margin={{ top: 20 }}
                height={300}
                barCategoryGap={32} // increases spacing between categories
                barSize={30}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="totalGross"
                  stackId="a"
                  fill={payGroupChartConfig.totalGross.color}
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="totalNet"
                  stackId="a"
                  fill={payGroupChartConfig.totalNet.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
