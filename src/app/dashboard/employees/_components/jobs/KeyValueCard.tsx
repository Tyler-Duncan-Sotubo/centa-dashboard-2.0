// src/components/KeyValueCard.tsx
import React from "react";
import { EntitySheet } from "../EntitySheet";
import { UpdateCoreSheet } from "../UpdateCoreSheet";

export interface KeyValueCardProps {
  title: string;
  items: {
    label: string;
    value: string;
    displayValue?: React.ReactNode;
    name: string;
  }[];
  fieldName: string;
  employeeId: string;
}

export function KeyValueCard({
  title,
  items,
  fieldName,
  employeeId,
}: KeyValueCardProps) {
  const initialData = items.reduce<Record<string, unknown>>((acc, item) => {
    acc[item.name] = item.displayValue; // ✅ use the raw value for the form
    return acc;
  }, {});

  return (
    <div className="shadow-md bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold mb-6 text-xl">{title}</h2>
        {fieldName !== "employee" ? (
          <EntitySheet
            entityType={fieldName as "finance" | "compensation" | "employee"}
            employeeId={employeeId}
            initialData={initialData}
            recordId={undefined}
          />
        ) : (
          <UpdateCoreSheet employeeId={employeeId} employee={initialData} />
        )}
      </div>
      <div className="space-y-2 text-md">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <p className="font-semibold">{item.label}</p>
            <p className="w-[50%] capitalize">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
