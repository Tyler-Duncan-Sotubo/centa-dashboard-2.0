"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { attendanceReportResponseSchema } from "../schema/attendance-report.schema";
import type { AttendanceReportResponse } from "../types/attendance-report.types";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

export function useAttendanceReport() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const now = new Date();
  const currentYear = now.getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(currentMonth);

  const yearMonth = useMemo(() => `${year}-${month}` as const, [year, month]);
  const enabled = !!session?.backendTokens?.accessToken;

  const fetchAttendanceCombined =
    async (): Promise<AttendanceReportResponse> => {
      try {
        const res = await axios.get(
          `/api/attendance-report/attendance/combined?yearMonth=${yearMonth}`,
        );

        // optional validation
        return attendanceReportResponseSchema.parse(res.data.data);
      } catch (err) {
        if (isAxiosError(err) && err.response) return {};
        throw err;
      }
    };

  const query = useQuery({
    queryKey: ["attendance-combined", yearMonth],
    queryFn: fetchAttendanceCombined,
    enabled,
  });

  return {
    status,
    year,
    month,
    years,
    months,
    setYear,
    setMonth,
    yearMonth,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    enabled,
    token: session?.backendTokens?.accessToken,
  };
}
