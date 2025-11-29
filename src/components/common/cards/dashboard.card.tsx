// components/OverviewCards.tsx
"use client";

import React from "react";
import {
  CreditCard,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { RunSummary } from "@/types/payroll.type";

export const OverviewCards = ({
  runSummaries,
}: {
  runSummaries: RunSummary[] | undefined;
}) => {
  // 1) Latest run = first item (they’re sorted desc by date)
  // const latest: RunSummary | undefined = runSummaries?.[0];

  const monthlyAggregates = runSummaries?.reduce((acc, run) => {
    const month = run.payrollMonth;
    if (!acc[month]) {
      acc[month] = {
        totalGross: 0,
        totalBonuses: 0,
        costPerRun: 0,
      };
    }
    acc[month].totalGross += Number(run.totalGross);
    acc[month].totalBonuses += Number(run.totalBonuses);
    acc[month].costPerRun += Number(run.costPerRun);
    return acc;
  }, {} as Record<string, { totalGross: number; totalBonuses: number; costPerRun: number }>);

  const sortedMonths = Object.keys(monthlyAggregates || {})
    .sort()
    .reverse();

  const latestMonth = sortedMonths[0];
  const prevMonth = sortedMonths[1];

  const latestAgg = latestMonth
    ? monthlyAggregates?.[latestMonth] ?? null
    : null;
  const prevAgg = prevMonth ? monthlyAggregates?.[prevMonth] ?? null : null;

  let trendElement: React.ReactNode = null;

  if (latestAgg) {
    const { totalGross } = latestAgg;
    const prevGross = prevAgg?.totalGross ?? 0;
    const change =
      prevGross !== 0 ? ((totalGross - prevGross) / prevGross) * 100 : 100;
    const isUp = totalGross > prevGross;
    const isSame = totalGross === prevGross;

    trendElement = (
      <span className="text-xs flex items-center gap-1">
        {isUp ? (
          <TrendingUp size={14} color="green" />
        ) : isSame ? (
          <Minus size={14} color="gray" />
        ) : (
          <TrendingDown size={14} color="red" />
        )}
        {change.toFixed(1)}%
      </span>
    );
  }

  // 2) Find previous month’s run (same payrollMonth)
  // const prevMonth = latest
  //   ? `${Number(latest.payrollMonth.slice(0, 4))}-${String(
  //       Number(latest.payrollMonth.slice(5)) - 1
  //     ).padStart(2, "0")}`
  //   : null;
  // const prevRun = runSummaries?.find((r) => r.payrollMonth === prevMonth);

  // 3) Compute trend vs previous
  // let trendElement: React.ReactNode = null;
  // if (latest) {
  //   const currGross = Number(latest.totalGross);
  //   const prevGross = prevRun ? Number(prevRun.totalGross) : 0;
  //   const change =
  //     prevGross !== 0 ? ((currGross - prevGross) / prevGross) * 100 : 100;
  //   const isUp = currGross > prevGross;
  //   const isSame = currGross === prevGross;

  //   trendElement = prevRun ? (
  //     <span className="text-xs flex items-center gap-1">
  //       {isUp ? (
  //         <TrendingUp size={14} color="green" />
  //       ) : isSame ? (
  //         <Minus size={14} color="gray" />
  //       ) : (
  //         <TrendingDown size={14} color="red" />
  //       )}
  //       {change.toFixed(1)}%
  //     </span>
  //   ) : (
  //     <span className="text-xs flex items-center gap-1">
  //       <TrendingUp size={14} color="green" /> 100%
  //     </span>
  //   );
  // }

  // 4) Build the cards
  const cards = [
    {
      title: "Total Gross Pay",
      value: latestAgg ? formatCurrency(latestAgg.totalGross) : "N/A",
      icon: <CreditCard size={16} color="white" />,
      bg: "bg-brand/60",
      diff: trendElement,
    },
    {
      title: "Recent Payroll Cost",
      value: latestAgg ? formatCurrency(latestAgg.costPerRun) : "N/A",
      icon: <CheckCircle size={16} color="white" />,
      bg: "bg-teal-600",
      diff: null,
    },
    {
      title: "Bonus & Incentives",
      value: latestAgg ? formatCurrency(latestAgg.totalBonuses) : "N/A",
      icon: <CreditCard size={16} color="white" />,
      bg: "bg-textPrimary/60",
      diff: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6 ">
      {cards.map((c) => (
        <div
          key={c.title}
          className="p-4 rounded-xl shadow-xs border flex flex-col space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
            <h3 className="text-sm font-bold text-textSecondary">{c.title}</h3>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold">{c.value}</p>
            {c.diff && <div>{c.diff}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
