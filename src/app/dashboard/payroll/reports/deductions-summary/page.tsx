"use client";

import React, { useState } from "react";
import { DeductionTrendChart } from "./_components/DeductionTrendChart";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { DeductionByEmployeeTable } from "./_components/DeductionByEmployeeTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ExportMenu } from "@/components/ExportMenu";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

const DeductionSummary = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const yearMonth = `${year}-${month}`;

  const fetchDeductionSummary = async () => {
    const res = await axiosInstance.get(
      `/api/payroll-report/deductions-summary?month=${yearMonth}`
    );
    return res.data.data;
  };

  const {
    data,
    isLoading: isLoadingDed,
    isError,
  } = useQuery({
    queryKey: ["deduction-summary", yearMonth],
    queryFn: fetchDeductionSummary,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoadingDed) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading deduction summary.</div>;
  }

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
    <div className="px-5 mb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Deductions Summary</h1>
        <div className="flex items-center gap-2">
          <YearSelector />
          <ExportMenu
            exportPath="/api/payroll-report/gen-employee-deductions"
            query={{
              month: yearMonth,
            }}
          />
        </div>
      </div>
      <DeductionByEmployeeTable data={data.deductionByEmployee} />
      <DeductionTrendChart
        deductionBreakdown={data.deductionBreakdown}
        employerCostBreakdown={data.employerCostBreakdown}
      />
    </div>
  );
};

export default DeductionSummary;
