"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CompetencyHeatmapProps {
  heatmap: Record<string, Record<string, number | string>>;
  isLoading: boolean;
}

export function CompetencyHeatmap({
  heatmap,
  isLoading,
}: CompetencyHeatmapProps) {
  // Loading or empty state
  if (isLoading || !heatmap || Object.keys(heatmap).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competency Radar</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Aggregate: sum all levels for each competency into "value"
  const data = Object.entries(heatmap).map(([name, levels]) => ({
    competency: name,
    value: Object.values(levels).reduce(
      (sum, v) => Number(sum) + Number(v || 0),
      0
    ),
  }));

  const maxValue = Math.max(...data.map((d) => Number(d.value)), 1);

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Competency Radar</CardTitle>
        <CardDescription>
          Compare relative strengths across competencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" />
            <PolarRadiusAxis angle={30} domain={[0, maxValue]} />
            <Radar
              name="Competency Level"
              dataKey="value"
              stroke="#00626F"
              fill="#4BB78F"
              fillOpacity={0.7}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
