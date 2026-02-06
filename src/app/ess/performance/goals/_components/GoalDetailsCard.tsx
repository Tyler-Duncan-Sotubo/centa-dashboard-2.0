"use client";

import { Badge } from "@/shared/ui/badge";

interface GoalDetailsCardProps {
  goal: {
    title: string;
    description: string;
    cycleName: string;
    status: string;
    weight: number;
    startDate: string;
    dueDate: string;
  };
}

interface InfoFieldProps {
  label: string;
  children: React.ReactNode;
}

export function InfoField({ label, children }: InfoFieldProps) {
  return (
    <div>
      <p className="text-muted-foreground text-md font-medium">{label}</p>
      <div className="text-xmd">{children}</div>
    </div>
  );
}

export function GoalDetailsCard({ goal }: GoalDetailsCardProps) {
  return (
    <div className="border rounded-lg px-3 py-6 bg-muted/30">
      <h2 className="text-2xl font-semibold mb-6">Goal Details</h2>

      <div className="space-y-3 text-sm flex flex-wrap gap-8">
        <div className="space-y-4 flex-1">
          <InfoField label="Title">{goal.title}</InfoField>
          <InfoField label="Description">{goal.description}</InfoField>
          <InfoField label="Cycle">{goal.cycleName}</InfoField>
          <InfoField label="Weight">{goal.weight}%</InfoField>
        </div>

        <div className="space-y-4 flex-1">
          <InfoField label="Status">
            <Badge variant="approved" className="capitalize">
              {goal.status}
            </Badge>
          </InfoField>
          <InfoField label="Start">
            {new Date(goal.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </InfoField>
          <InfoField label="Due">
            {new Date(goal.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </InfoField>
        </div>
      </div>
    </div>
  );
}
