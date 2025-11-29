"use client";

import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import PageHeader from "@/components/pageHeader";
import OnboardingEmployeesTable from "./_components/OnboardingEmployeesTable";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { OnboardingEmployee } from "@/types/onboarding/onboarding.type";
import { SendOnboardingInviteSheet } from "./_components/SendOnboardingInviteSheet";
import EmptyState from "@/components/empty-state";

const OnboardingPage = () => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchEmployeesOnboarding = async () => {
    try {
      const res = await axiosInstance.get("/api/onboarding/employees");
      return res.data.data as OnboardingEmployee[];
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
      return [];
    }
  };

  const { data, isLoading, isError } = useQuery<OnboardingEmployee[]>({
    queryKey: ["onboarding-employees"],
    queryFn: fetchEmployeesOnboarding,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-5">
      <div className="mb-6">
        <PageHeader
          title="Recent Onboardings"
          description="Manage your onboarding templates for new employees."
        >
          <SendOnboardingInviteSheet />
        </PageHeader>
      </div>

      {/* Render the onboarding employees table or an empty state */}
      {data?.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Active Onboarding"
            description="It seems like there are no onboarding employees at the moment. You can invite employees to start the onboarding process."
            image={
              "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585350/onboarding_izogcj.svg"
            } // or "/images/empty-jobs.png" from public folder
          />
        </div>
      ) : (
        <OnboardingEmployeesTable data={data} />
      )}
    </div>
  );
};

export default OnboardingPage;
