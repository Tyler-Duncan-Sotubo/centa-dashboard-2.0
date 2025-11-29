"use client";

import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import {
  AttendanceDetails,
  AttendanceMetrics,
  AttendanceSummaryItem,
} from "@/types/attendance.type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timesheet } from "./_components/TimeSheet";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import OfficeLocation from "../company/offices/_components/OfficeLocation";

interface DailyAttendance {
  details: AttendanceDetails;
  metrics: AttendanceMetrics;
  summaryList: AttendanceSummaryItem[] | undefined;
}

const AttendancePage = () => {
  const { data: session, status } = useSession();
  const axiosAuth = useAxiosAuth();

  const fetchDailyAttendance = async () => {
    try {
      const res = await axiosAuth.get(
        "/api/clock-in-out/daily-dashboard-stats"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, error } = useQuery<DailyAttendance>({
    queryKey: ["attendance"],
    queryFn: fetchDailyAttendance,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <section className="p-5">
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">TimeSheet</TabsTrigger>
          <TabsTrigger value="office">Office Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <Timesheet data={data} />
        </TabsContent>
        <TabsContent value="office">
          <div className="my-10">
            <OfficeLocation />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AttendancePage;
