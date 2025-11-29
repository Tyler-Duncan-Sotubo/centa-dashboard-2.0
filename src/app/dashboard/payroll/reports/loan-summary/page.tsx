"use client";

import { DataTable } from "@/components/DataTable";
import React from "react";
import { LoanOutstandingColumns } from "./_components/LoanOutstandingColumns";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { LoanMonthlySummaryChart } from "./_components/LoanMonthlySummary";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { BiExport } from "react-icons/bi";
import { useDownloadFile } from "@/utils/useDownloadFile";
import useAxiosAuth from "@/hooks/useAxiosAuth";

interface ExportButtonProps {
  endpoint: string;
  label?: string;
}

const LoanMonthlySummary = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: isDownloading } = useDownloadFile(token);

  const fetchBalanceReport = async () => {
    try {
      const res = await axiosInstance.get("/api/payroll-report/summary");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { loanBalances: [] };
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["loan-balance-report"],
    queryFn: fetchBalanceReport,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  function ExportButton({ endpoint, label = "Export" }: ExportButtonProps) {
    const handleExport = async () => {
      try {
        await download(`/api/payroll-report/${endpoint}`);
      } finally {
      }
    };

    return (
      <Button
        variant="secondary"
        onClick={handleExport}
        isLoading={isDownloading}
        disabled={isDownloading}
      >
        <BiExport />
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  return (
    <div className="px-5 space-y-10">
      <PageHeader
        title="Loan Monthly Summary"
        description="View the monthly summary of loans, repayments, and outstanding amounts."
      >
        <ExportButton endpoint="gen-loan-summary" />
      </PageHeader>

      <LoanMonthlySummaryChart data={data.monthlySummary} />

      <div>
        <h2 className="text-lg font-semibold">Loan Summary By Employees</h2>

        <DataTable
          columns={LoanOutstandingColumns}
          data={data.outstandingSummary}
        />
      </div>
    </div>
  );
};

export default LoanMonthlySummary;
