"use client";

import { PayrollSchedule } from "@/components/common/tables/payroll-schedule";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { Employee, EmployeeGroup } from "@/types/employees.type";
import { EmployeeDetail } from "@/types/payRunDetails";
import { SalaryBreakdown } from "@/types/salaryBreakdown";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

interface PayrollPreview {
  allEmployees: Employee[];
  groups: EmployeeGroup[];
  payrollSummary: EmployeeDetail[];
  salaryBreakdown: SalaryBreakdown;
}
export const PayrollHistory = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayrollPreview = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/payroll-preview"
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
  } = useQuery({
    queryKey: ["payroll"],
    queryFn: fetchPayrollPreview,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const { payrollSummary } = payrollPreview as PayrollPreview;

  const pendingPayroll = payrollSummary?.filter(
    (payroll) =>
      payroll.paymentStatus === "in-progress" ||
      payroll.paymentStatus === "paid"
  );

  return (
    <section className="my-10">
      <PageHeader
        title="Payroll History"
        description="View all payroll history and details"
      />
      <div className="my-10">
        <PayrollSchedule data={pendingPayroll} />
      </div>
    </section>
  );
};
