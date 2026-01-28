"use client";

import React from "react";
import TaxConfig from "./TaxConfigPage";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const Taxes = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchCompanyTaxDetails = async () => {
    try {
      const res = await axiosInstance.get("/api/company-tax-details");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: taxDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company-tax-details"],
    queryFn: fetchCompanyTaxDetails,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return <TaxConfig taxDetail={taxDetails} />;
};

export default Taxes;
