"use client";

import React from "react";
import { Progress } from "@/shared/ui/progress";
import { MetricCard } from "./MetricCard";
import {
  FaListAlt,
  FaRegChartBar,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";

type Props = {
  totalAssessments: number;
  submitted: number;
  avgScore: number;
};

export function PerformanceKPIs({
  totalAssessments,
  submitted,
  avgScore,
}: Props) {
  const completionRate = totalAssessments ? submitted / totalAssessments : 0;
  const percent = Math.round(completionRate * 100);

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">KPI Cards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<FaListAlt size={16} />} label="Total Assessments">
          <div className="text-2xl font-semibold">{totalAssessments}</div>
        </MetricCard>

        <MetricCard icon={<FaRegChartBar size={16} />} label="Submission Rate">
          <div className="text-2xl font-semibold">{percent}%</div>
          <Progress value={percent} className="mt-2 w-full" />
        </MetricCard>

        <MetricCard icon={<FaCheckCircle size={16} />} label="Submitted">
          <div className="text-2xl font-semibold">{submitted}</div>
        </MetricCard>

        <MetricCard icon={<FaHourglassHalf size={16} />} label="Avg Score">
          <div className="text-2xl font-semibold">
            {Number(avgScore || 0).toFixed(1)}
          </div>
        </MetricCard>
      </div>
    </section>
  );
}
