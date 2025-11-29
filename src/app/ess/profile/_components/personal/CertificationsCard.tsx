import React from "react";
import { EntitySheet } from "../EntitySheet";

export function CertificationsCard({
  certifications,
  employeeId, // This prop is not used in the component but can be useful for context
}: {
  certifications: Array<{
    id: string;
    name: string;
    authority: string;
    licenseNumber: string;
    issueDate: string;
    expiryDate: string;
    documentUrl: string;
  }>;
  employeeId: string; // This prop is not used in the component but can be useful for context
}) {
  return (
    <div className="bg-white rounded-lg p-6 border">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold text-xl">Certifications</h2>
        <EntitySheet
          entityType="certification"
          employeeId={employeeId}
          initialData={undefined} // no data = add mode
          recordId={undefined}
        />
      </div>

      {/* List of existing certifications with Edit buttons */}
      <div className="space-y-4 text-sm">
        {certifications.map((c) => {
          return (
            <div key={c.id} className="flex items-start">
              {/* Content + inline Edit */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">
                    {c.name} <span className="text-muted-foreground">at</span>{" "}
                    {c.authority}
                  </p>
                  <EntitySheet
                    entityType="certification"
                    employeeId={employeeId}
                    initialData={c} // prefill form
                    recordId={c.id} // edit mode
                  />
                </div>
                <p>License #: {c.licenseNumber}</p>
                <p className="text-muted-foreground">
                  {c.issueDate} → {c.expiryDate}
                </p>
                <a
                  href={c.documentUrl}
                  className="text-brand underline text-sm"
                >
                  View Document
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
