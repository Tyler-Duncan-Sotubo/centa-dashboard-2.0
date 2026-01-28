"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { OrgChartNodeDto } from "../types/org-chart.type";
import { useSession } from "next-auth/react";

type EmployeeOrgChartResponse = {
  chain: OrgChartNodeDto[];
  focus: OrgChartNodeDto;
  directReports: OrgChartNodeDto[];
};

export function useOrgChart() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  const { data: session } = useSession();

  const enabledAuth = !!session?.backendTokens?.accessToken;

  /**
   * ✅ IMPORTANT:
   * Keep the same exported name `rootsQuery` so UI doesn't change,
   * but load 4-depth preview under the hood.
   */
  const rootsQuery = useQuery<OrgChartNodeDto[]>({
    // keep the same key so anything relying on it still works
    queryKey: ["orgChart", "roots"],
    queryFn: async () => {
      // ✅ use preview route (4 levels) but keep "rootsQuery" variable name
      const res = await axios.get("/api/org-chart/preview/4");
      return res.data.data ?? res.data;
    },
    enabled: enabledAuth,
    staleTime: 60_000,
  });

  const fetchChildren = async (managerId: string) => {
    const res = await axios.get(`/api/org-chart/children/${managerId}`);
    return (res.data.data ?? res.data) as OrgChartNodeDto[];
  };

  const prefetchChildren = (managerId: string) => {
    if (!enabledAuth || !managerId) return Promise.resolve();
    return qc.prefetchQuery({
      queryKey: ["orgChart", "children", managerId],
      queryFn: () => fetchChildren(managerId),
      staleTime: 60_000,
    });
  };

  const childrenQuery = (managerId: string, enabled: boolean) =>
    useQuery<OrgChartNodeDto[]>({
      queryKey: ["orgChart", "children", managerId],
      queryFn: () => fetchChildren(managerId),
      enabled: enabledAuth && enabled && !!managerId,
      staleTime: 60_000,
    });

  // ✅ employee focus endpoint
  const fetchEmployeeOrgChart = async (employeeId: string) => {
    const res = await axios.get(`/api/org-chart/employee/${employeeId}`);
    return (res.data.data ?? res.data) as EmployeeOrgChartResponse;
  };

  const employeeQuery = (employeeId: string, enabled: boolean) =>
    useQuery<EmployeeOrgChartResponse>({
      queryKey: ["orgChart", "employee", employeeId],
      queryFn: () => fetchEmployeeOrgChart(employeeId),
      enabled: enabledAuth && enabled && !!employeeId,
      staleTime: 60_000,
    });

  // Optional: still expose preview helpers if you want to call different depths later
  const fetchPreview = async (depth = 4) => {
    const res = await axios.get(`/api/org-chart/preview/${depth}`);
    return (res.data.data ?? res.data) as OrgChartNodeDto[];
  };

  const previewQuery = (depth: number, enabled: boolean) =>
    useQuery<OrgChartNodeDto[]>({
      queryKey: ["orgChart", "preview", depth],
      queryFn: () => fetchPreview(depth),
      enabled: enabledAuth && enabled,
      staleTime: 60_000,
    });

  return {
    // UI keeps using rootsQuery, but it now returns 4 layers
    rootsQuery,

    childrenQuery,
    prefetchChildren,

    employeeQuery,
    fetchEmployeeOrgChart,

    previewQuery,
    fetchPreview,
  };
}
