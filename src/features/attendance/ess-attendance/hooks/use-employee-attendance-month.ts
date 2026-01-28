"use client";

import { useMemo, useState } from "react";
import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { getEmployeeAttendanceMonth } from "./employee-attendance.client";

export function useEmployeeAttendanceMonth() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  const yearMonth = useMemo(
    () => format(currentDate, "yyyy-MM"),
    [currentDate],
  );
  const employeeId = session?.user?.id as string | undefined;

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    if (isSameMonth(new Date(), next) || next < new Date())
      setCurrentDate(next);
  };

  const query = useQuery({
    queryKey: ["employee-attendance-month", employeeId, yearMonth],
    enabled: !!employeeId,
    queryFn: () =>
      getEmployeeAttendanceMonth(axios, {
        employeeId: employeeId!,
        yearMonth,
      }),
  });

  return {
    currentDate,
    yearMonth,
    employeeId,
    handlePrevMonth,
    handleNextMonth,
    monthData: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
