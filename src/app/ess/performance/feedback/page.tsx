"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaUsers,
  FaUserFriends,
  FaUser,
  FaUserTie,
  FaArchive,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { TbMessageCircle } from "react-icons/tb";
import FeedbackFormModal from "./_components/FeedbackFormModal";
import FeedbackTypeDropdown from "./_components/FeedbackTypeDropdown";
import FeedbackList from "./_components/FeedbackList";

type FeedbackType =
  | "self"
  | "peer"
  | "manager_to_employee"
  | "employee_to_manager"
  | "archived";

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackType | "all">("all");
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>("self");

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["feedbacks", category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.append("type", category);
      const res = await axios.get(
        `/api/feedback/employee/${session?.user.id}?${params.toString()}`
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["feedback-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback/settings");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["feedback-counts"],
    queryFn: async () => {
      const res = await axios.get(
        "/api/feedback/counts/employee/" + session?.user.id
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading || isLoadingSettings || isLoadingCounts) return <Loading />;

  return (
    <section className="space-y-8">
      <PageHeader
        title="360° Feedback"
        description="Collect and manage feedback from all perspectives."
        icon={<TbMessageCircle />}
      >
        <div className="flex items-center space-x-2">
          <FeedbackTypeDropdown
            onSelect={(type) => {
              setSelectedType(type);
              setOpen(true);
            }}
            settings={settings}
            userRole={session?.user?.role || "employee"}
          />
        </div>
      </PageHeader>

      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as "all" | FeedbackType)}
        className="mt-6 space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            <FaUsers className="w-4 h-4 mr-2 text-monzo-brandDark" />
            All
            {counts?.all > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="peer">
            <FaUserFriends className="w-4 h-4 mr-2 text-monzo-secondary" />
            Peer
            {counts?.peer > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.peer}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="self">
            <FaUser className="w-4 h-4 mr-2 text-monzo-error" />
            Self
            {counts?.self > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.self}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="employee_to_manager">
            <FaUser className="w-4 h-4 mr-2 text-monzo-success" />
            Employee
            {counts?.employee_to_manager > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.employee_to_manager}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="manager_to_employee">
            <FaUserTie className="w-4 h-4 mr-2 text-monzo-monzoGreen" />
            Manager
            {counts?.manager_to_employee > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.manager_to_employee}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">
            <FaArchive className="w-4 h-4 mr-2 text-muted-foreground" />
            Archived
            {counts?.archived > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.archived}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : (
            <FeedbackList feedbacks={feedbacks} />
          )}
        </div>
        <FeedbackFormModal
          open={open}
          setOpen={setOpen}
          type={
            selectedType as
              | "self"
              | "peer"
              | "manager_to_employee"
              | "employee_to_manager"
          }
        />
      </Tabs>
    </section>
  );
}
