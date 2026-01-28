"use client";

import React from "react";
import PageHeader from "@/shared/ui/page-header";
import EmptyState from "@/shared/ui/empty-state";
import Loading from "@/shared/ui/loading";
import { EnrolledBenefitsSection } from "@/features/benefits/ui/EnrolledBenefitsSection";
import { useBenefitPlans } from "../hooks/use-benefit-plans";
import { useBenefitEnrollments } from "../hooks/use-benefit-enrollments";
import BenefitCategoryGrid from "./BenefitCategoryGrid";
import { Gift } from "lucide-react";

export const EssBenefitClient = () => {
  const { plans, isLoadingBenefits, isErrorBenefits } = useBenefitPlans();

  const { employeeId, enrollments, isLoadingEnrollments } =
    useBenefitEnrollments();

  if (isLoadingBenefits || isLoadingEnrollments) return <Loading />;
  if (isErrorBenefits)
    return <p className="text-red-500">Error loading benefit plans.</p>;

  return (
    <div className="space-y-8 mb-10">
      <PageHeader
        title="Benefits"
        description="Explore and manage your benefit plans."
      />

      {employeeId && enrollments.length > 0 && (
        <EnrolledBenefitsSection
          enrollments={enrollments}
          employeeId={employeeId}
        />
      )}

      {plans.length === 0 ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <EmptyState
            title="No Benefit Categories Available"
            description="It looks like there are no benefit categories available at this time."
            icon={<Gift className="h-20 w-20 text-brand mx-auto" />}
          />
        </div>
      ) : (
        <div className="space-y-6 ">
          <h2 className="text-xl font-bold">Available Benefit Categories</h2>
          <BenefitCategoryGrid plans={plans} />
        </div>
      )}
    </div>
  );
};
