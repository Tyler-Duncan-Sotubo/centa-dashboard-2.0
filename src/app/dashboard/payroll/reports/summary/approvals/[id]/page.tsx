"use client";

import React from "react";
import Approval from "./Approval";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

type PageProps = {
  params: Promise<{ id: string }>;
};

const ApprovalPage = ({ params }: PageProps) => {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayslip = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/payroll/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: payRun,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payRun", id],
    queryFn: () => (id ? fetchPayslip(id) : Promise.resolve(null)),
    enabled: !!id && Boolean(session?.backendTokens?.accessToken),
    retry: 2,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p className="text-red-500">Error loading data</p>;

  return <Approval payslip={payRun} />;
};

export default ApprovalPage;
