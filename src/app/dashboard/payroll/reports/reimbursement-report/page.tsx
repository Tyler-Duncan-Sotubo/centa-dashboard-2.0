"use client";

import React, { useState } from "react";
import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/DataTable";
import { ReimbursementColumns } from "./_components/ReimbursementColumns";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import { FilterSection } from "./_components/FilterSection";
import { ExportMenu } from "@/components/ExportMenu";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const ReimbursementReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const token = session?.backendTokens?.accessToken;

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("");
  };

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (statusFilter) params.append("status", statusFilter);

      const res = await axiosInstance.get(
        `/api/expenses/reimbursement-report?${params.toString()}`
      );

      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reimbursement-report", fromDate, toDate, statusFilter],
    queryFn: fetchReport,
    enabled: !!token,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-5 space-y-10">
      <PageHeader
        title="Reimbursement Report"
        description="All expense reimbursement records"
      >
        <ExportMenu
          exportPath="/api/expenses/reimbursement-report/export"
          query={{
            fromDate,
            toDate,
            status: statusFilter,
          }}
        />
      </PageHeader>

      <FilterSection
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
      />

      <DataTable columns={ReimbursementColumns} data={data} />
    </div>
  );
};

export default ReimbursementReportPage;
