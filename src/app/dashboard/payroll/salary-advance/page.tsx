"use client";

import React from "react";
import LoansPage from "./_components/LoansPage";
import { useQuery } from "@tanstack/react-query";
import { Loan } from "@/types/loans.type";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { ClientGuard } from "@/lib/guard/ClientGuard";

const SalaryAdvance = () => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchLoans = async () => {
    try {
      const res = await axiosInstance.get("/api/salary-advance");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: loans,
    isLoading: loadingSalariesAdvance,
    isError: errorSalariesAdvance,
  } = useQuery<Loan[]>({
    queryKey: ["loans"],
    queryFn: fetchLoans,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (loadingSalariesAdvance) return <Loading />;
  if (errorSalariesAdvance) return <p>Error loading data</p>;
  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <LoansPage loans={loans} />;
    </ClientGuard>
  );
};

export default SalaryAdvance;
