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

const COLORS = ["#4BB78F", "#FE4B60", "#F1BD76", "#868E9C"]; // Completed, Overdue, Incomplete, Extra

export function GoalAndFeedbackCharts({
  goalPerformance,
  feedbackActivity,
}: GoalAndFeedbackChartsProps) {
  // Prepare data for Goal Pie
  const incompleteGoals =
    goalPerformance?.totalGoals -
    goalPerformance?.completedGoals -
    goalPerformance?.overdueGoals;

  const goalPieData = [
    {
      name: "Completed",
      value: goalPerformance?.completedGoals,
      fill: COLORS[0],
    },
    { name: "Overdue", value: goalPerformance?.overdueGoals, fill: COLORS[1] },
    {
      name: "Incomplete",
      value: incompleteGoals > 0 ? incompleteGoals : 0,
      fill: COLORS[2],
    },
  ];

  // Feedback Bar Data
  const feedbackBarData = [
    { type: "Peer", count: feedbackActivity?.peerCount },
    { type: "Manager", count: feedbackActivity?.managerCount },
    { type: "Self", count: feedbackActivity?.selfCount },
  ];

  return (
    <div className="mt-5 space-y-6">
      {/* Goal Performance Donut */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Performance</CardTitle>
          <CardDescription>Completed vs Overdue vs Incomplete</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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
                labelLine={true}
              >
                {goalPieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
                <Label
                  value={`${goalPerformance?.completedGoals}/${goalPerformance?.totalGoals} Completed`}
                  position="center"
                  className="fill-foreground text-md"
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feedback Activity Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Activity</CardTitle>
          <CardDescription>Types of Feedback Submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={feedbackBarData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4BB78F" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-muted-foreground flex flex-col gap-1">
            <div>
              <span className="font-semibold">Avg per Employee:</span>{" "}
              {feedbackActivity?.avgPerEmployee.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Anonymity Rate:</span>{" "}
              {(feedbackActivity?.anonymityRate * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
