"use client";

import React from "react";
import UsersAndRoles from "./UsersAndRoles";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const Roles = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchCompanyUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/company-users");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchCompanyUsers,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return <UsersAndRoles users={users} />;
};

export default Roles;
