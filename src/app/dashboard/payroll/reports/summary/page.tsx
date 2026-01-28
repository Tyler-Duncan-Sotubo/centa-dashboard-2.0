"use client";

import React from "react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { PayrollOverview } from "./_components/PayrollOverview";
import { PayrollSummaryPieChart } from "./_components/PayrollSummaryPieChart";
import { PayrollHistory } from "./_components/PayrollHistory";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const PayrollReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayrollOverview = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/analytics-report",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics-report"],
    queryFn: fetchPayrollOverview,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="px-5">
      <PayrollHistory />
      <section className="md:flex py-5 gap-4 w-full">
        <PayrollOverview payrollSummary={data.summary} />
        <PayrollSummaryPieChart payrollSummary={data.summary} />
      </section>
    </section>
  );
};

export default PayrollReportPage;
