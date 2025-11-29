"use client";

import React from "react";
import { EmployeeGroupsTable } from "@/components/common/tables/groups.table";
import { EmployeeGroup } from "@/types/employees.type";
import GroupModal from "./GroupModal";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const PayGroupSettings = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/pay-groups");
      return res.data.data as EmployeeGroup[];
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
      throw error;
    }
  };

  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery<EmployeeGroup[]>({
    queryKey: ["pay-group"],
    queryFn: fetchGroups,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="px-4">
      <PageHeader
        title="Pay Groups"
        description="Manage employee groups and their settings"
      />
      <div className="flex justify-end">
        <GroupModal />
      </div>
      <EmployeeGroupsTable data={groups} />
    </section>
  );
};

export default PayGroupSettings;
