// components/MetricCard.tsx
"use client";

import React, { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

export function MetricCard({ icon, label, children }: MetricCardProps) {
  return (
    <div className="flex flex-col justify-center border rounded-xl px-2 py-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium flex items-center gap-2 mb-3">
        <span className="p-2 bg-muted text-muted-foreground rounded-full">
          {icon}
        </span>
        {label}
      </p>
      <div className="my-auto">{children}</div>
    </div>
  );
}
