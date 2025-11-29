"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Question } from "@/types/performance/question-competency.type";

type Props = {
  questions: Record<string, Question[]>;
};

export default function CompetencyRadarChartCard({ questions }: Props) {
  const chartData = Object.entries(questions).map(([competency, items]) => {
    const scores: number[] = [];

    for (const q of items) {
      if (q.type === "rating") {
        scores.push(Number(q.response));
      } else if (q.type === "yes_no") {
        scores.push(q.response === "yes" ? 5 : 0);
      }
    }

    const avg =
      scores.length > 0
        ? parseFloat(
            (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
          )
        : 0;

    return {
      competency,
      score: avg,
    };
  });

  const chartConfig = {
    score: {
      label: "Score",
      color: "#00626F", // monzoOrange
    },
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Competency Radar Chart</h3>
        <p className="text-muted-foreground text-sm">
          Based on rating and yes/no question responses
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-square max-h-[400px] w-full"
      >
        <RadarChart outerRadius="80%" data={chartData}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarGrid />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fontSize: 15, fill: "#00626F" }} // monzo textPrimary
          />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            dataKey="score"
            fill="#00626F" // monzoOrange
            fillOpacity={0.6}
            stroke="#00626F"
            dot={{ r: 4, fillOpacity: 1 }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
