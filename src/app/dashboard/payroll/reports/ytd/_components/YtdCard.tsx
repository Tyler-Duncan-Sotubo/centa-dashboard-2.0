"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  FaMoneyBillWave,
  FaWallet,
  FaLandmark,
  FaRegChartBar,
  FaUserShield,
  FaHandHoldingUsd,
} from "react-icons/fa";
import { ExportMenu } from "@/components/ExportMenu";

type Totals = {
  gross_salary_ytd: number | string;
  net_salary_ytd: number | string;
  paye_tax_ytd: number | string;
  pension_contribution_ytd: number | string;
  employer_pension_contribution_ytd: number | string;
  nhf_contribution_ytd: number | string;
};

type YtdStatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
};

export const YtdStatCard = ({
  title,
  value,
  icon,
  colorClass,
}: YtdStatCardProps) => {
  return (
    <Card className={`border-l-4 ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col">
          <CardTitle className="text-md font-medium text-muted-foreground ">
            {title}
          </CardTitle>
          <CardDescription className="text-xl font-semibold text-foreground">
            {formatCurrency(Number(value))}
          </CardDescription>
        </div>
        <div className="text-xl text-muted-foreground">{icon}</div>
      </CardHeader>
    </Card>
  );
};

const YtdCard = ({ totals }: { totals: Totals }) => {
  const items = [
    {
      title: "Gross Salary YTD",
      value: totals?.gross_salary_ytd,
      icon: <FaMoneyBillWave />,
      colorClass: "border-green-500",
    },
    {
      title: "Net Salary YTD",
      value: totals?.net_salary_ytd,
      icon: <FaWallet />,
      colorClass: "border-blue-500",
    },
    {
      title: "PAYE Tax YTD",
      value: totals?.paye_tax_ytd,
      icon: <FaLandmark />,
      colorClass: "border-yellow-500",
    },
    {
      title: "Pension (Employee)",
      value: totals?.pension_contribution_ytd,
      icon: <FaRegChartBar />,
      colorClass: "border-purple-500",
    },
    {
      title: "Pension (Employer)",
      value: totals?.employer_pension_contribution_ytd,
      icon: <FaUserShield />,
      colorClass: "border-indigo-500",
    },
    {
      title: "NHF Contribution",
      value: totals?.nhf_contribution_ytd,
      icon: <FaHandHoldingUsd />,
      colorClass: "border-gray-400",
    },
  ];
  // "api/payroll-report/gen-company-ytd",

  return (
    <section className="space-y-4 py-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-semibold mb-2">YTD Payroll Summary</h2>
          <p className="text-gray-500 text-sm w-1/2">
            This is the Year to Date (YTD) summary of the payroll for the
            current year. It includes gross salary, net salary, PAYE tax,
            pension contributions, and NHF contributions.
          </p>
        </div>
        <ExportMenu
          exportPath="/api/payroll-report/gen-company-ytd"
          query={{}}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <YtdStatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            colorClass={item.colorClass}
          />
        ))}
      </div>
    </section>
  );
};

export default YtdCard;
