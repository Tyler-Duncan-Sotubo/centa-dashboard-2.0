import React from "react";
import { format, isValid } from "date-fns";
import { EntitySheet } from "../EntitySheet";

type Certification = {
  id: string;
  name?: string | null;
  authority?: string | null;
  licenseNumber?: string | null;
  issueDate?: string | null; // ISO or yyyy-mm-dd
  expiryDate?: string | null; // nullable for non-expiring
  documentUrl?: string | null;
};

function fmtDate(d?: string | null) {
  if (!d) return "N/A";
  const dt = new Date(d);
  return isValid(dt) ? format(dt, "MMM dd, yyyy") : "N/A";
}

export function CertificationsCard({
  certifications,
  employeeId,
}: {
  certifications?: Certification[] | null;
  employeeId: string;
}) {
  const items = certifications ?? [];

  return (
    <div className="shadow-md bg-white rounded-lg p-6 border">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold text-xl">Certifications</h2>
        <EntitySheet
          entityType="certification"
          employeeId={employeeId}
          initialData={undefined} // add mode
          recordId={undefined}
        />
      </div>

      {/* List */}
      <div className="space-y-4 text-sm">
        {items.length === 0 ? (
          <div className="text-muted-foreground">No certifications yet.</div>
        ) : (
          items.map((c) => {
            const issue = fmtDate(c.issueDate);
            const expiry = c.expiryDate ? fmtDate(c.expiryDate) : "Present";
            const hasDoc = !!c.documentUrl;

            return (
              <div key={c.id} className="flex items-start">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center gap-3">
                    <p className="font-semibold">
                      {c.name || "Untitled"}{" "}
                      <span className="text-muted-foreground">at</span>{" "}
                      {c.authority || "N/A"}
                    </p>
                    <EntitySheet
                      entityType="certification"
                      employeeId={employeeId}
                      initialData={c}
                      recordId={c.id}
                    />
                  </div>

                  <p>
                    <span className="text-muted-foreground">License #:</span>{" "}
                    {c.licenseNumber || "N/A"}
                  </p>

                  <p className="text-muted-foreground">
                    {issue} → {expiry}
                  </p>

                  {hasDoc ? (
                    <a
                      href={c.documentUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline text-sm"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No document attached
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
