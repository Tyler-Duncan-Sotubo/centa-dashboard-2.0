// src/components/FinancialsCard.tsx
import React from "react";
import { KeyValueCard, KeyValueCardProps } from "./KeyValueCard";

export interface Financials {
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankAccountName: string;
  tin: string;
  pensionPin: string;
  nhfNumber: string;
}

interface FinancialsCardProps {
  financials: Financials;
  employeeId: string; // Add employeeId if needed for EntitySheet
}

export function FinancialsCard({
  financials,
  employeeId,
}: FinancialsCardProps) {
  const items: KeyValueCardProps["items"] = [
    {
      label: "Bank",
      value: financials.bankName,
      displayValue: financials.bankName, // Use displayValue if you want to show something different
      name: "bankName",
    },
    {
      label: "Branch",
      value: financials.bankBranch,
      displayValue: financials.bankBranch, // Use displayValue if you want to show something different
      name: "bankBranch",
    },

    {
      label: "Account",
      value: financials.bankAccountNumber,
      displayValue: financials.bankAccountNumber, // Use displayValue if you want to show something different
      name: "bankAccountNumber",
    },
    {
      label: "Account Name",
      value: financials.bankAccountName,
      displayValue: financials.bankAccountName, // Use displayValue if you want to show something different
      name: "bankAccountName",
    },
    {
      label: "TIN",
      value: financials.tin,
      displayValue: financials.tin, // Use displayValue if you want to show something different
      name: "tin",
    },
    {
      label: "Pension PIN",
      value: financials.pensionPin,
      displayValue: financials.pensionPin,
      name: "pensionPin",
    },
    {
      label: "NHF #",
      value: financials.nhfNumber,
      displayValue: financials.nhfNumber,
      name: "nhfNumber",
    },
  ];

  return (
    <KeyValueCard
      title="Financials"
      items={items}
      fieldName="finance"
      employeeId={employeeId}
    />
  );
}
