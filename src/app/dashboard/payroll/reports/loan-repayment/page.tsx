"use client";

import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";
import { LoanRepaymentColumns } from "./_components/LoanRepaymentColumns";
import PageHeader from "@/shared/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ExportMenu } from "@/shared/ui/export-menu";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const LoanRepaymentReport = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const fetchBalanceReport = async () => {
    try {
      const res = await axiosInstance.get("/api/payroll-report/repayment");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { loanBalances: [] };
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["loan-repayment-report"],
    queryFn: fetchBalanceReport,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  // Extract unique months for filtering
  const months = useMemo(() => {
    if (!data) return [];

    const uniqueMonths = Array.from(
      new Set(
        data.map((item: { lastRepayment: string }) =>
          format(new Date(item.lastRepayment), "yyyy-MM"),
        ),
      ),
    ) as string[];

    return uniqueMonths.sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(
      (item: {
        lastRepayment: string;
        // other properties can be added as needed
      }) => {
        if (selectedMonth === "all") return true;
        const itemMonth = format(new Date(item.lastRepayment), "yyyy-MM");
        return itemMonth === selectedMonth;
      },
    );
  }, [data, selectedMonth]);

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-5 mt-5">
      <PageHeader
        title="Loan Repayment Report"
        description="View and manage loan repayment records."
      ></PageHeader>

      <div className="flex justify-end mb-4 space-x-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[220px]">
            <CalendarIcon className="w-4 h-4" />
            <SelectValue placeholder="Filter by Repayment Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {format(new Date(month + "-01"), "MMMM yyyy")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportMenu
          exportPath="/api/payroll-report/gen-loan-repayment"
          query={{
            month: selectedMonth,
          }}
        />
      </div>

      <div className="mt-10">
        <DataTable columns={LoanRepaymentColumns} data={filteredData} />
      </div>
    </div>
  );
};

export default LoanRepaymentReport;
