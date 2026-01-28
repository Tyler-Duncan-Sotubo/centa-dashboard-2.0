"use client";

import Loading from "@/shared/ui/loading";
import TaxesPage from "./TaxesPage";
import { Taxes } from "@/types/taxes.type";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { ClientGuard } from "@/lib/guard/ClientGuard";

const TaxCompliance = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchTaxFiles = async () => {
    try {
      const res = await axiosInstance.get("/api/tax");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: taxes,
    isLoading,
    error,
  } = useQuery<Taxes[]>({
    queryKey: ["taxes"],
    queryFn: fetchTaxFiles,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (error)
    return (
      <div>
        <p>Error</p>
      </div>
    );

  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <TaxesPage taxes={taxes} />
    </ClientGuard>
  );
};

export default TaxCompliance;
