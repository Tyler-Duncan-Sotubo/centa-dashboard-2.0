"use client";

import Loading from "@/shared/ui/loading";

import { useSession } from "next-auth/react";
import { useDailyAttendanceQuery } from "../hooks/use-daily-attendance-query";
import { Timesheet } from "./timesheet";

export function AttendanceView() {
  const { status } = useSession();
  const { data, isLoading, error } = useDailyAttendanceQuery();

  if (status === "loading" || isLoading) return <Loading />;

  if (error) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <section className="p-5">
      <Timesheet data={data} />
    </section>
  );
}
