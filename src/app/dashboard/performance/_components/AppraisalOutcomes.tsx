"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { COLORS } from "@/shared/utils/colors";

interface AppraisalOutcomesProps {
  avgScore: number;
  scoreDistribution: Array<{ name: string; value: number }>;
}

export function AppraisalOutcomes({
  avgScore,
  scoreDistribution,
}: AppraisalOutcomesProps) {
  // ChartConfig drives the legend/tooltip colors if you use them
  const histConfig = {
    value: { label: "Count", color: COLORS.monzoGreen },
    name: { label: "Score Range", color: COLORS.textSecondary },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avg Score</CardTitle>
        <CardDescription>Across Current Cycle</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-2xl font-semibold">{avgScore.toFixed(1)}</div>

        <ChartContainer config={histConfig} className="h-40">
          <BarChart
            data={scoreDistribution}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={COLORS.innerBg} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke={COLORS.textSecondary}
            />
            <YAxis stroke={COLORS.textSecondary} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={COLORS.monzoGreen} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
