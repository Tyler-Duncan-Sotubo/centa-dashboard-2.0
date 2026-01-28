"use client";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { EmployeeDetail } from "@/types/payRunDetails";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { OffCycleDetailsTable } from "./OffCycleDetailsTable";

export const OffCyclePayrollHistory = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayrollPreview = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/off-cycle-report/off-payroll-summary",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: payrollPreview,
    isLoading,
    isError,
  } = useQuery<EmployeeDetail[]>({
    queryKey: ["payroll"],
    queryFn: fetchPayrollPreview,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="my-10">
      <PageHeader
        title="Payroll History"
        description="View all payroll history and details"
      />
      <div className="my-10">
        <OffCycleDetailsTable data={payrollPreview} />
      </div>
    </section>
  );
};
