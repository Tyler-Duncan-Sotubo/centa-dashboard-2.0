"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";

interface GoalAndFeedbackChartsProps {
  goalPerformance: {
    totalGoals: number;
    completedGoals: number;
    overdueGoals: number;
  };
  feedbackActivity: {
    peerCount: number;
    managerCount: number;
    selfCount: number;
    avgPerEmployee: number;
    anonymityRate: number;
  };
}

const COLORS = ["#4BB78F", "#FE4B60", "#F1BD76"];

export function GoalAndFeedbackCharts({
  goalPerformance,
  feedbackActivity,
}: GoalAndFeedbackChartsProps) {
  const incompleteGoals =
    goalPerformance.totalGoals -
    goalPerformance.completedGoals -
    goalPerformance.overdueGoals;

  const goalPieData = [
    {
      name: "Completed",
      value: goalPerformance.completedGoals,
      fill: COLORS[0],
    },
    { name: "Overdue", value: goalPerformance.overdueGoals, fill: COLORS[1] },
    {
      name: "Incomplete",
      value: Math.max(incompleteGoals, 0),
      fill: COLORS[2],
    },
  ];

  const feedbackBarData = [
    { type: "Peer", count: feedbackActivity.peerCount },
    { type: "Manager", count: feedbackActivity.managerCount },
    { type: "Self", count: feedbackActivity.selfCount },
  ];

  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Goal Performance */}
      <Card className="h-90 flex flex-col">
        <CardHeader>
          <CardTitle>Goal Performance</CardTitle>
          <CardDescription>Completed vs Overdue vs Incomplete</CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={goalPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {goalPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <Label
                  value={`${goalPerformance.completedGoals}/${goalPerformance.totalGoals} Completed`}
                  position="center"
                  className="fill-foreground text-md"
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feedback Activity */}
      <Card className="h-90 flex flex-col">
        <CardHeader>
          <CardTitle>Feedback Activity</CardTitle>
          <CardDescription>Types of Feedback Submitted</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedbackBarData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4BB78F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-xs text-muted-foreground flex flex-col gap-1">
            <div>
              <span className="font-semibold">Avg per Employee:</span>{" "}
              {Number(feedbackActivity.avgPerEmployee || 0).toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Anonymity Rate:</span>{" "}
              {Math.round((feedbackActivity.anonymityRate || 0) * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
