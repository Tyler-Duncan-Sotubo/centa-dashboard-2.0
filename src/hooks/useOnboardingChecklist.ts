import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/lib/axios";

export type OnboardingProgress = {
  id: number;
  companyId: number;
  taskKey: string;
  completed: boolean;
  completedAt: Date | null;
};

export function useOnboardingChecklist() {
  const { data: session } = useSession();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const fetchOnboarding = async (
    token: string
  ): Promise<OnboardingProgress[]> => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    if (onboardingCompleted === "true") {
      return [];
    }
    const res = await axiosInstance("/api/company-settings/onboarding", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  };

  const {
    data: onboarding,
    isLoading,
    isError,
  } = useQuery<OnboardingProgress[]>({
    queryKey: ["onboarding"],
    queryFn: () =>
      fetchOnboarding(session?.backendTokens.accessToken as string),
    enabled: !!session?.backendTokens.accessToken,
  });

  useEffect(() => {
    if (onboarding) {
      const tasksArray = Object.entries(onboarding); // convert to array of [key, value]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const completed = tasksArray.filter(([_, completed]) => completed).length;
      const total = tasksArray.length;
      const allTasksCompleted = completed === total;

      setProgressPercentage((completed / total) * 100);
      setCompletedTasks(completed);
      setTotalTasks(total);

      if (allTasksCompleted) {
        localStorage.setItem("onboardingCompleted", "true");
        setIsModalOpen(false);
      }
    }
  }, [onboarding]);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    if (onboardingCompleted === "true") {
      setIsModalOpen(false);
    }
  }, []);

  return {
    onboarding,
    isLoading,
    isError,
    progressPercentage,
    completedTasks,
    totalTasks,
    isModalOpen,
    setIsModalOpen,
  };
}
