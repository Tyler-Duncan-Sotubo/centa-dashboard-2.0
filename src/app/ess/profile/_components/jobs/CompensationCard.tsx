// src/components/CompensationCard.tsx
import React from "react";
import { format } from "date-fns";
import { KeyValueCard, KeyValueCardProps } from "./KeyValueCard";

export interface Compensation {
  startDate: string;
  grossSalary: number;
  currency: string;
  applyNhf: boolean;
}

interface CompensationCardProps {
  compensations: Compensation;
  employeeId: string; // Add employeeId if needed for EntitySheet
}

export function CompensationCard({
  compensations,
  employeeId,
}: CompensationCardProps) {
  const items: KeyValueCardProps["items"] = [
    {
      label: "Effective",
      value: compensations.startDate
        ? format(new Date(compensations.startDate), "PPP")
        : "N/A",
      name: "startDate",
      displayValue: compensations.startDate,
    },
    {
      label: "Gross Salary",
      value: `${compensations.grossSalary.toLocaleString()} `,
      name: "grossSalary",
      displayValue: compensations.grossSalary,
    },
    {
      label: "NHF Applied",
      value: compensations.applyNhf ? "Yes" : "No",
      name: "applyNhf",
      displayValue: compensations.applyNhf ? "Yes" : "No",
    },
  ];

  return (
    <KeyValueCard
      title="Compensation"
      items={items}
      fieldName="compensation"
      employeeId={employeeId}
    />
  );
}
