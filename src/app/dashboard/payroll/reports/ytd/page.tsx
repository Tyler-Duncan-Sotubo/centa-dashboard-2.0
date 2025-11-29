"use client";

import React from "react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { YtdEmployeeTable } from "./_components/YtdEmployeeTable";
import YtdCard from "./_components/YtdCard";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const YtdReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayrollOverview = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/analytics-report"
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
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="px-5">
      <YtdCard totals={data.ytdData.totals} />
      <YtdEmployeeTable data={data.ytdData.employees} />
    </section>
  );
};

export default YtdReportPage;
