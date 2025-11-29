"use client";

import React from "react";
import Link from "next/link";
import { HeartPulse, Activity, Gift, PiggyBank, Bus } from "lucide-react";
import { FaHeart, FaWheelchair } from "react-icons/fa";
import { FaTooth } from "react-icons/fa6";
import { BenefitPlan } from "@/types/benefits.type";

type benefitCategories = [
  "Health",
  "Dental",
  "Wellness",
  "Perks",
  "Life Insurance",
  "Disability Insurance",
  "Retirement Plans",
  "Commuter Benefits"
];

export const categoryMeta: Record<
  benefitCategories[number],
  { icon: React.ReactNode; description: string }
> = {
  Health: {
    icon: <HeartPulse className="h-8 w-8 text-red-500" />,
    description:
      "Comprehensive medical, hospital and prescription coverage for you and your family.",
  },
  Dental: {
    icon: <FaTooth className="h-8 w-8 text-amber-500" />,
    description:
      "Routine check-ups, cleanings, and orthodontics—keeping every smile healthy.",
  },
  Wellness: {
    icon: <Activity className="h-8 w-8 text-sky-500" />,
    description:
      "Gym memberships, mental-health resources and lifestyle coaching to boost wellbeing.",
  },
  Perks: {
    icon: <Gift className="h-8 w-8 text-pink-500" />,
    description:
      "Employee discounts, gift cards and fun extras that recognise and reward great work.",
  },
  "Life Insurance": {
    icon: <FaHeart className="h-8 w-8 text-rose-600" />,
    description:
      "Term life cover that provides financial security for your loved ones if the unexpected happens.",
  },
  "Disability Insurance": {
    icon: <FaWheelchair className="h-8 w-8 text-purple-600" />,
    description:
      "Short- and long-term disability benefits that replace income when illness or injury keeps you from working.",
  },
  "Retirement Plans": {
    icon: <PiggyBank className="h-8 w-8 text-yellow-600" />,
    description:
      "Company-sponsored 401(k) and pension options—often with employer matching—to help you save for the future.",
  },
  "Commuter Benefits": {
    icon: <Bus className="h-8 w-8 text-indigo-600" />,
    description:
      "Tax-advantaged transit passes and parking reimbursements to make your daily commute more affordable.",
  },
};

export default function BenefitCategoryGrid({
  plans,
}: {
  plans: BenefitPlan[];
}) {
  const uniqueCategories = Array.from(
    new Set(plans.map((plan) => plan.category))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {uniqueCategories.map((category) => {
        const planCount = plans.filter((p) => p.category === category).length;
        const meta = categoryMeta[category as keyof typeof categoryMeta];

        if (!meta || planCount === 0) return null;

        return (
          <Link
            href={`/ess/benefits/enroll?category=${encodeURIComponent(
              category
            )}`}
            className="w-full space-y-3 border rounded-xl p-4"
            key={category}
          >
            <div className="flex flex-row items-start justify-between gap-4">
              {meta.icon}
            </div>

            <div className="flex items-center space-x-2 font-semibold">
              <h3 className="text-md">{category}</h3>
              <p className="text-sm font-medium">
                {planCount} plan{planCount > 1 ? "s" : ""} available
              </p>
            </div>

            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
