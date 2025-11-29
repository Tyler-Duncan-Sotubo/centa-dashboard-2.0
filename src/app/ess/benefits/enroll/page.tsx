"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import BenefitPlanCard from "../_components/BenefitPlanCard";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";
import { BenefitPlan } from "@/types/benefits.type";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function EnrollByCategoryPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const {
    data: benefits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["benefits"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/api/benefit-plan`);
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) return [];
        throw err;
      }
    },
  });

  const filtered = category
    ? benefits.filter((b: BenefitPlan) => b.category === category)
    : [];

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Error loading data. Try again.</p>;

  if (!category)
    return <p className="text-muted-foreground">No category selected.</p>;

  if (filtered.length === 0)
    return (
      <div className="space-y-4">
        <NavBackButton href="/ess/benefits">Back to Categories</NavBackButton>
        <p className="text-muted-foreground">
          No benefit plans found in <strong>{category}</strong>.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <NavBackButton href="/ess/benefits">Back to Categories</NavBackButton>
      <PageHeader
        title={`${category} Plans`}
        description={`Choose from the available ${category?.toLowerCase()} plans below.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plan: BenefitPlan) => (
          <BenefitPlanCard key={plan.id} plan={plan} isEnrolled={false} />
        ))}
      </div>
    </div>
  );
}
