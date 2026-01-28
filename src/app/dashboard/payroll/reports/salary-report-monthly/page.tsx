"use client";

import React from "react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import SalaryOverview from "./_components/SalaryOverview";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const SalaryReportPage = () => {
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
      <SalaryOverview data={data.salaryInsights} />
    </section>
  );
};

export default SalaryReportPage;
