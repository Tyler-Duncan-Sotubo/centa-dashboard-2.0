"use client";

import React from "react";
import Onboarding from "./OrganizationPage";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const Organization = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchCompany = async () => {
    try {
      const res = await axiosInstance.get("api/company");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: company,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company"],
    queryFn: fetchCompany,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return <Onboarding company={company} />;
};

export default Organization;
