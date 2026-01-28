"use client";

import React from "react";
import { EmployeeModal } from "../../_components/invite/EmployeeInvite";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

type PageProps = {
  params: Promise<{ id: string }>;
};

const EmployeePage = ({ params }: PageProps) => {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchEmployee = async () => {
    try {
      const res = await axiosInstance.get(`/api/employees/${id}/full`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };
  // Fetch employee data if we're editing an existing employee
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee", id],
    queryFn: fetchEmployee,
    enabled: Boolean(session?.backendTokens?.accessToken) && !!id,
  });

  // While either the session or employee data is loading, show loading state
  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;
  return <EmployeeModal employee={data} />;
};

export default EmployeePage;
