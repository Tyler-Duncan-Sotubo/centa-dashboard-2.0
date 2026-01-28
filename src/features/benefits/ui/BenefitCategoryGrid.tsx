"use client";

import React from "react";
import Link from "next/link";
import { HeartPulse, Activity, Gift, PiggyBank, Bus } from "lucide-react";
import { FaHeart, FaWheelchair } from "react-icons/fa";
import { FaTooth } from "react-icons/fa6";
import { BenefitPlan } from "@/types/benefits.type";
import { categoryMeta } from "../config/benefit.constants";

export default function BenefitCategoryGrid({
  plans,
}: {
  plans: BenefitPlan[];
}) {
  const uniqueCategories = Array.from(
    new Set(plans.map((plan) => plan.category)),
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
              category,
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
