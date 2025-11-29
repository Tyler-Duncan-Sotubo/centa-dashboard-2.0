"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PayrollDashboard } from "@/types/payroll.type";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  FaDollarSign,
  FaBalanceScale,
  FaGift,
  FaChartLine,
} from "react-icons/fa";

export function YtdSummary({
  yearToDate,
}: {
  yearToDate: PayrollDashboard["yearToDate"] | undefined;
}) {
  const items = [
    {
      label: "Gross YTD",
      value: Number(yearToDate?.totalGrossYTD),
      icon: <FaDollarSign className="h-5 w-5" />,
      color: { bg: "bg-blue-100", text: "text-blue-600" },
    },
    {
      label: "Deductions YTD",
      value: Number(yearToDate?.totalDeductionsYTD),
      icon: <FaBalanceScale className="h-5 w-5" />,
      color: { bg: "bg-red-100", text: "text-red-600" },
    },
    {
      label: "Bonuses YTD",
      value: Number(yearToDate?.totalBonusesYTD),
      icon: <FaGift className="h-5 w-5" />,
      color: { bg: "bg-green-100", text: "text-green-600" },
    },
    {
      label: "Net YTD",
      value: Number(yearToDate?.totalNetYTD),
      icon: <FaChartLine className="h-5 w-5" />,
      color: { bg: "bg-teal-100", text: "text-teal-600" },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-3">
      {items.map(({ label, value, icon, color }) => (
        <Card key={label}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${color.bg}`}>
                {React.cloneElement(icon, {
                  className: `${color.text} h-5 w-5`,
                })}
              </div>
              <CardTitle className="text-sm font-semibold">{label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
