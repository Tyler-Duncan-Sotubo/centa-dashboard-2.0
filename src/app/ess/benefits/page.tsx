"use client";

import React from "react";
import BenefitCategoryGrid from "./_components/BenefitCategoryGrid";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { BenefitEnrollment } from "@/types/benefits.type";
import { categoryMeta } from "./_components/BenefitCategoryGrid";
import { formatCurrency } from "@/utils/formatCurrency";
import PageHeader from "@/components/pageHeader";
import OptOutDialog from "./_components/OptOutDialog";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

const BenefitPage = () => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const employeeId = session?.user.id;
  const token = session?.backendTokens?.accessToken;

  /* ------------------- Fetch Company Plans ------------------- */
  const {
    data: benefits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["benefits"],
    enabled: !!token,
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

  /* ------------------- Fetch Active Enrollments ------------------- */
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["benefit-enrollments", employeeId],
    enabled: !!employeeId && !!token,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/benefit-plan/enrollments/${employeeId}`
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) return [];
        throw err;
      }
    },
  });

  if (isLoading || loadingEnrollments) return <Loading />;
  if (isError)
    return <p className="text-red-500">Error loading benefit plans.</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Benefits"
        description="Explore and manage your benefit plans."
      />
      {/* Enrolled Summary Card */}
      {enrollments.length === 0 ? (
        ""
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Your Enrolled Benefits</h2>
          {Object.entries(
            enrollments.reduce(
              (
                acc: Record<string, BenefitEnrollment[]>,
                plan: BenefitEnrollment
              ) => {
                const category = plan.category || "Uncategorized";
                acc[category] = acc[category] || [];
                acc[category].push(plan);
                return acc;
              },
              {}
            )
          ).map(([category]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {categoryMeta[category as keyof typeof categoryMeta]?.icon}
                <h3 className="text-md font-semibold">{category}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {enrollments.map((plan: BenefitEnrollment) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <section className="flex items-center justify-between">
                        <div>
                          <CardTitle>{plan.planName}</CardTitle>
                          <CardDescription>
                            {new Date(plan.startDate).toLocaleDateString()} –{" "}
                            {new Date(plan.endDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <OptOutDialog
                          benefitPlanId={plan.benefitPlanId}
                          employeeId={employeeId as string}
                          planName={plan.planName}
                        />
                      </section>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between text-md font-semibold">
                        <p>Cost:</p>
                        <p>
                          {formatCurrency(
                            plan.monthlyCost ? Number(plan.monthlyCost) : 0
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between text-md font-semibold">
                        <p>Coverage:</p>
                        <p>{plan.selectedCoverage || "N/A"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Categories */}
      {benefits.length === 0 ? (
        <EmptyState
          title="No Benefit Categories Available"
          description="It looks like there are no benefit categories available at this time."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585351/benefit_ctumav.svg"
          } // or "/images/empty-jobs.png" from public folder
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Available Benefit Categories</h2>
          <BenefitCategoryGrid plans={benefits} />
        </div>
      )}
    </div>
  );
};

export default BenefitPage;
