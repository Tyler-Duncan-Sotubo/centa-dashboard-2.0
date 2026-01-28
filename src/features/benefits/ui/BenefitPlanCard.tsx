"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Badge } from "@/shared/ui/badge";
import { useSession } from "next-auth/react";
import { BenefitPlan } from "@/types/benefits.type";
import { useRouter } from "next/navigation";
import FormError from "@/shared/ui/form-error";
import { Separator } from "@/shared/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { formatCurrency } from "@/shared/utils/formatCurrency";

export default function BenefitPlanCard({
  plan,
  isEnrolled,
}: {
  plan: BenefitPlan;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const employeeId = session?.user.id;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCoverage, setSelectedCoverage] = React.useState<string>("");

  const enroll = useCreateMutation({
    endpoint: `/api/benefit-plan/enrollments/${employeeId}`,
    successMessage: "Enrolled successfully",
    onSuccess: () => {
      setIsLoading(false);
      router.push("/ess/benefits");
    },
    onError: () => setIsLoading(false),
    refetchKey: "benefits-enrollments",
  });

  const handleEnroll = () => {
    if (isEnrolled || !selectedCoverage) return;
    setIsLoading(true);
    enroll({ benefitPlanId: plan.id, selectedCoverage }, setError);
  };

  const costBreakdown = Object.entries(plan.cost ?? {}) as [string, string][];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.description || "No description provided."}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-sm space-y-4">
        {/* Coverage options selector */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">
            Choose Coverage Tier
          </p>
          <Select value={selectedCoverage} onValueChange={setSelectedCoverage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select coverage" />
            </SelectTrigger>
            <SelectContent>
              {plan.coverageOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cost breakdown */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">
            Monthly Cost:
          </p>
          {costBreakdown.map(([tier, amount]) => (
            <p key={tier} className="flex justify-between">
              <span>{tier}</span>
              <span className="font-semibold">
                {formatCurrency(parseFloat(amount))}
              </span>
            </p>
          ))}
        </div>

        {/* Dates & split */}
        <p className="text-muted-foreground">
          Coverage: {new Date(plan.startDate).toLocaleDateString()} –{" "}
          {new Date(plan.endDate).toLocaleDateString()}
        </p>
        <p className="text-muted-foreground">
          Payment Split:{" "}
          <span className="capitalize font-medium">{plan.split}</span>
          {plan.split === "shared" && plan.employerContribution > 0 && (
            <> – Employer contributes ₦{plan.employerContribution}</>
          )}
        </p>
      </CardContent>

      <Separator />

      <div className="p-4">
        {error && <FormError message={error} className="mt-2 text-md" />}
      </div>

      <CardFooter>
        {isEnrolled ? (
          <Badge className="w-full text-center bg-monzo-monzoGreen/10 text-monzo-monzoGreen">
            Already Enrolled
          </Badge>
        ) : (
          <Button
            className="w-full"
            onClick={handleEnroll}
            disabled={isLoading || !selectedCoverage}
          >
            {isLoading ? "Enrolling..." : "Enroll"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
