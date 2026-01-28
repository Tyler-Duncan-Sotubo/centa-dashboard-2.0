"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

export function useShiftDashboardMonth() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const token = session?.backendTokens?.accessToken;

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);
  const yearMonth = useMemo(() => `${year}-${month}`, [year, month]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [reportFilters, setReportFilters] = useState<{
    yearMonth: string;
    locationId?: string;
    departmentId?: string;
  }>({
    yearMonth: `${currentYear}-${currentMonth}`,
  });

  const fetchShiftSummary = async () => {
    try {
      const params = new URLSearchParams();
      params.set("yearMonth", reportFilters.yearMonth);

      if (reportFilters.locationId)
        params.set("locationId", reportFilters.locationId);
      if (reportFilters.departmentId)
        params.set("departmentId", reportFilters.departmentId);

      const res = await axiosInstance.get(
        `/api/attendance-report/shift-summary?${params.toString()}`,
      );

      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["shift-summary", yearMonth, reportFilters],
    queryFn: fetchShiftSummary,
    enabled: !!token,
  });

  return {
    status,
    token,

    years,
    months,

    year,
    month,
    setYear,
    setMonth,
    yearMonth,

    settingsOpen,
    setSettingsOpen,

    reportFilters,
    setReportFilters,

    data: query.data,
    isLoading: query.isLoading,
    isError: !!query.error,
    error: query.error,
  };
}
