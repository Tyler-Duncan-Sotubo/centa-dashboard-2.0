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
import { useWorkspace } from "@/shared/context/workspace";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { workspace } = useWorkspace();

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
      <PageHeader
        title="Dashboard"
        description="Welcome to your dashboard. Here you can find an overview of your profile, leave balances, clock-in status, and company announcements."
      />
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10 mt-5">
        {/* Middle Column – ClockInCard + Announcements */}
        <div className="md:col-span-4 space-y-6 order-1">
          {/* Pending Tasks Widget */}
          {data.pendingChecklists && data.pendingChecklists.length > 0 && (
            <div className="md:col-span-12 space-y-6 order-4">
              <PendingTasksWidget checklist={data.pendingChecklists} />
            </div>
          )}
          <ClockInCard />
          <EmployeeProfileCard employee={user} />
        </div>

        {/* Left Column – Profile (on desktop), shown after leave on mobile */}
        <div className="md:col-span-5 space-y-6 order-2">
          {data.announcements && data.announcements.length > 0 ? (
            <AnnouncementsCard announcements={data.announcements} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
          {data.leaveBalance ? (
            <LeaveManagementCard leaves={data.leaveBalance} />
          ) : (
            <Skeleton className="h-56 w-full" />
          )}
        </div>

        {/* Right Column – Calendar + LeaveManagementCard (only on md+) */}
        <div className="md:col-span-3 space-y-6 order-3">
          <InteractiveCalendarCard data={data} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
