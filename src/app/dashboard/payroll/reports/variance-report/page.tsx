"use client";

import { useQuery } from "@tanstack/react-query";
import CompanyVarianceTable from "./_components/CompanyVarianceTable";
import EmployeeVarianceTable from "./_components/EmployeeVarianceTable";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button";
import { BiExport } from "react-icons/bi";
import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const PayrollVariancePage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading: downloadLoading } = useDownloadFile(token);

  const fetchPayrollOffCycle = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-report/company-variance-report",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["variance-report"],
    queryFn: fetchPayrollOffCycle,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  function ExportButton({
    endpoint,
    label = "Export",
  }: {
    endpoint: string;
    label?: string;
  }) {
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
        isLoading={downloadLoading}
        disabled={downloadLoading}
      >
        <BiExport />
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  return (
    <div className="container py-8 px-5">
      <div className="mb-4">
        <PageHeader
          title="Payroll Variance Report"
          description="View and export payroll variance reports for your company and employees."
        />
      </div>

      {data?.company?.rows.length !== 0 && (
        <div className="flex justify-end mb-4">
          <ExportButton endpoint="gen-company-variance" />
        </div>
      )}
      <CompanyVarianceTable data={data?.company} />

      {data?.employees?.rows.length !== 0 && (
        <div className="flex justify-end mb-4">
          <ExportButton endpoint="gen-employee-variance" />
        </div>
      )}
      <EmployeeVarianceTable data={data?.employees} />
    </div>
  );
};

export default PayrollVariancePage;
