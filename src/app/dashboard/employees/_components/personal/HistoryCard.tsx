import React from "react";
import { EntitySheet } from "../EntitySheet";

type HistoryType = "education" | "employment";

export type HistoryItem = {
  id: string;
  type: HistoryType;
  title: string;
  institution: string;
  description?: string | null;
  startDate?: string | null; // ISO or yyyy-mm-dd
  endDate?: string | null; // ISO or yyyy-mm-dd (nullable = present)
};

function safeYear(d?: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt.getFullYear();
}

function yearRange(start?: string | null, end?: string | null) {
  const s = safeYear(start);
  const e = safeYear(end);
  if (!s && !e) return "N/A";
  if (s && !e) return `${s} – Present`;
  if (!s && e) return `… – ${e}`;
  return `${s} – ${e}`;
}

export function HistoryCard({
  history,
  employeeId,
}: {
  history?: HistoryItem[] | null;
  employeeId: string;
}) {
  const sections: HistoryType[] = ["education", "employment"];
  const list = history ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section) => {
        const items = list.filter((h) => h.type === section);

        return (
          <div
            className="shadow-md bg-white rounded-lg p-6 border flex flex-col"
            key={section}
          >
            {/* Section Header with “Add” */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="capitalize font-semibold text-xl">{section}</h2>
              <EntitySheet
                entityType="history"
                employeeId={employeeId}
                // Tell the sheet which kind we’re creating
                initialData={{ type: section }}
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
                        <div className="flex justify-between gap-3">
                          <p className="text-md">
                            <span className="font-semibold">{item.title}</span>
                            {item.institution ? (
                              <>
                                <span className="text-muted-foreground">
                                  {" "}
                                  at{" "}
                                </span>
                                {item.institution}
                              </>
                            ) : null}
                          </p>
                          {/* Edit button for each record */}
                          <EntitySheet
                            entityType="history"
                            employeeId={employeeId}
                            initialData={item}
                            recordId={item.id}
                          />
                        </div>
                        {item.description ? (
                          <p className="text-md">{item.description}</p>
                        ) : null}
                        <p className="text-sm text-muted-foreground">
                          {yearRange(item.startDate, item.endDate)}
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
