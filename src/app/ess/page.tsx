"use client";

import AnnouncementsCard from "@/features/home/ess/AnnouncementsCard";
import ClockInCard from "@/features/home/ess/ClockInCard";
import EmployeeProfileCard from "@/features/home/ess/EmployeeProfileCard";
import InteractiveCalendarCard from "@/features/home/ess/InteractiveCalendarCard";
import LeaveManagementCard from "@/features/home/ess/LeaveManagementCard";
import React from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import PendingTasksWidget from "@/features/home/ess/PendingTasksWidget";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Skeleton } from "@/shared/ui/skeleton";
import { useAuth } from "@/shared/context/AuthContext";
import ClockInTimeOffCard from "@/features/home/ess/clock-in-time-off-card";
import MyTeamCard from "@/features/home/ess/my-team-card";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const name = session?.user?.firstName;

  const accessToken = session?.backendTokens?.accessToken;
  const employeeId = session?.employeeId ?? session?.user?.id ?? null;

  const enabled = status === "authenticated" && !!employeeId && !!accessToken;

  const { user, refreshUser } = useAuth();
  React.useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [user, refreshUser]);

  const fetchEmployees = async (id: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/company/employee-summary/${id}`,
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", employeeId],
    queryFn: () => fetchEmployees(employeeId as string),
    enabled,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div>
      <div className="mt-10">
        <p className="text-xl md:text-2xl font-bold">
          Hi {name}, glad you're here 👋🏽
        </p>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10 mt-20">
        {/* LEFT column: ClockIn + Profile + Announcements + Leave */}
        <div className="md:col-span-8 space-y-6">
          {data.pendingChecklists && data.pendingChecklists.length > 0 && (
            <PendingTasksWidget checklist={data.pendingChecklists} />
          )}

          <ClockInTimeOffCard employee={user} />
          <MyTeamCard />

          {data.announcements && data.announcements.length > 0 ? (
            <AnnouncementsCard announcements={data.announcements} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </div>

        {/* RIGHT column: Calendar */}
        <div className="md:col-span-4 space-y-6">
          <InteractiveCalendarCard data={data} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
