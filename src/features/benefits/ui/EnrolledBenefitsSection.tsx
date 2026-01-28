"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/ui/card";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import type { BenefitEnrollment } from "@/types/benefits.type";
import { categoryMeta } from "../config/benefit.constants";
import OptOutDialog from "./OptOutDialog";

type Props = {
  enrollments: BenefitEnrollment[];
  employeeId: string;
};

export function EnrolledBenefitsSection({ enrollments, employeeId }: Props) {
  const grouped = enrollments.reduce(
    (acc: Record<string, BenefitEnrollment[]>, plan) => {
      const category = plan.category || "Uncategorized";
      acc[category] = acc[category] || [];
      acc[category].push(plan);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Your Enrolled Benefits</h2>

      {Object.entries(grouped).map(([category, plans]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            {categoryMeta[category as keyof typeof categoryMeta]?.icon}
            <h3 className="text-md font-semibold">{category}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
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
                      employeeId={employeeId}
                      planName={plan.planName}
                    />
                  </section>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between text-md font-semibold">
                    <p>Cost:</p>
                    <p>
                      {formatCurrency(
                        plan.monthlyCost ? Number(plan.monthlyCost) : 0,
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
  );
}
