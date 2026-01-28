"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

export function useDepartmentAttendanceMonth() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);

  const yearMonth = useMemo(() => `${year}-${month}` as any, [year, month]);
  const enabled = !!session?.backendTokens?.accessToken;

  const fetchCombined = async () => {
    try {
      const res = await axios.get(
        `/api/attendance-report/attendance/combined?yearMonth=${yearMonth}`,
      );

      // res.data.data is what your page used
      return res.data.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) return {};
      throw err;
    }
  };

  const query = useQuery({
    queryKey: ["attendance-combined", yearMonth],
    queryFn: fetchCombined,
    enabled,
  });

  return {
    status,
    token: session?.backendTokens?.accessToken,
    year,
    month,
    setYear,
    setMonth,
    yearMonth,
    departmentSummary: query.data?.departmentSummary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
