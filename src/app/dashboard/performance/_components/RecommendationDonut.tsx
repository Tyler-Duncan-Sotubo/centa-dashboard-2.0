"use client";

import React from "react";
import { PieChart, Pie, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
import { COLORS } from "@/shared/utils/colors";

interface RecommendationDonutProps {
  recommendationCounts: Record<string, number>;
  periodLabel?: string;
}

export function RecommendationDonut({
  recommendationCounts,
  periodLabel = "Current Cycle",
}: RecommendationDonutProps) {
  // Build data array for the pie
  const names = Object.keys(recommendationCounts);
  const chartData = names.map((name) => ({
    name,
    value: recommendationCounts[name],
    fill: name.toLowerCase().includes("promote")
      ? COLORS.monzoGreen
      : name.toLowerCase().includes("hold")
        ? COLORS.monzoOrange
        : COLORS.error,
  }));

  // ChartConfig drives tooltip colors
  const chartConfig = {
    value: { label: "Count", color: COLORS.textSecondary },
    ...chartData.reduce((cfg, slice) => {
      cfg[slice.name] = { label: slice.name, color: slice.fill };
      return cfg;
    }, {} as ChartConfig),
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>Promote / Hold / Exit — {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              cornerRadius={8}
              stroke={COLORS.innerBg}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
