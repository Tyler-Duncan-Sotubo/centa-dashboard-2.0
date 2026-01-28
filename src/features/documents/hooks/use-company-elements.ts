"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

type CompanyElements = {
  roles?: { id: string; name: string }[];
  departments?: { id: string; name: string }[];
  locations?: { id: string; name: string }[];
};

export function useCompanyElements() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const fetchCompanyElements = async (): Promise<CompanyElements> => {
    try {
      const res = await axios.get("/api/company/company-elements");
      return res.data.data ?? {};
    } catch (e) {
      if (isAxiosError(e) && e.response) return {};
      throw e;
    }
  };

  return useQuery({
    queryKey: ["company-elements"],
    queryFn: fetchCompanyElements,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });
}
