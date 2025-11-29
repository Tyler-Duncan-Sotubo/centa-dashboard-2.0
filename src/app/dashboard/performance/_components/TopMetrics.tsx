"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import {
  FaListAlt,
  FaRegChartBar,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { MetricCard } from "./MetricCard";

interface TopMetricsProps {
  totalAppraisals: number;
  completionRate: number; // 0–1
  onTimeReviews: number;
  avgTimeToComplete: number; // days
}

export function TopMetrics({
  totalAppraisals,
  completionRate,
  onTimeReviews,
  avgTimeToComplete,
}: TopMetricsProps) {
  const percent = Math.round(completionRate * 100);

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">KPI Cards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Appraisals */}
        <MetricCard icon={<FaListAlt size={16} />} label="Total Appraisals">
          <div className="text-2xl font-semibold">{totalAppraisals}</div>
        </MetricCard>

        {/* 2. Completion Rate */}
        <MetricCard icon={<FaRegChartBar size={16} />} label="Completion Rate">
          <div className="text-2xl font-semibold">{percent}%</div>
          <Progress value={percent} className="mt-2 w-full" />
        </MetricCard>

        {/* 3. On-Time Reviews */}
        <MetricCard icon={<FaCheckCircle size={16} />} label="On-Time Reviews">
          <div className="text-2xl font-semibold">{onTimeReviews}</div>
        </MetricCard>

        {/* 4. Avg Time to Complete */}
        <MetricCard
          icon={<FaHourglassHalf size={16} />}
          label="Avg Time (days)"
        >
          <div className="text-2xl font-semibold">
            {avgTimeToComplete.toFixed(1)}
          </div>
        </MetricCard>
      </div>
    </section>
  );
}
