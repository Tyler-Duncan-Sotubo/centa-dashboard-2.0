import React from "react";
import { EntitySheet } from "../EntitySheet";

type HistoryItem = {
  id: string;
  type: "education" | "employment";
  title: string;
  institution: string;
  description: string;
  startDate: string;
  endDate: string;
};

export function HistoryCard({
  history,
  employeeId,
}: {
  history: HistoryItem[];
  employeeId: string;
}) {
  const sections = ["education", "employment"] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section) => {
        const items = history.filter((h) => h.type === section);

        return (
          <div
            className="bg-white rounded-lg p-6 border flex flex-col"
            key={section}
          >
            {/* Section Header with “Add” */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="capitalize font-semibold text-xl">{section}</h2>
              <EntitySheet
                entityType="history"
                employeeId={employeeId}
                initialData={undefined}
                recordId={undefined}
              />
            </div>

            {/* Entries or Empty State */}
            {items.length > 0 ? (
              <div className="space-y-4 text-sm">
                {items.map((item, idx) => {
                  const isLast = idx === items.length - 1;
                  return (
                    <div key={item.id} className="flex">
                      {/* Bullet + Connector */}
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 bg-brand rounded-full" />
                        {!isLast && <span className="flex-1 w-px bg-border" />}
                      </div>

                      {/* Content */}
                      <div className="ml-3 flex-1 space-y-1 -mt-1.5">
                        <div className="flex justify-between">
                          <p className="text-md">
                            <span className="font-semibold">{item.title}</span>
                            <span className="text-muted-foreground"> at </span>
                            {item.institution}
                          </p>
                          {/* Edit button for each record */}
                          <EntitySheet
                            entityType="history"
                            employeeId="123"
                            initialData={item}
                            recordId={item.id}
                          />
                        </div>
                        <p className="text-md">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.startDate).getFullYear()} –{" "}
                          {new Date(item.endDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No {section} records yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
