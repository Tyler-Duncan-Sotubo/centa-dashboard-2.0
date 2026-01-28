import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/ui/table";
import { EntitySheet } from "../EntitySheet";
import { format, isValid } from "date-fns";

type Dependent = {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string | null;
  isBeneficiary?: boolean | null;
};

function formatDob(d?: string | null) {
  if (!d) return "N/A";
  const dt = new Date(d);
  return isValid(dt) ? format(dt, "MMM dd, yyyy") : "N/A";
}

export function FamilyCard({
  family,
  employeeId,
}: {
  family?: Dependent[] | null;
  employeeId: string;
}) {
  const rows = family ?? [];

  return (
    <div className="shadow-md bg-white rounded-lg p-6 border">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold text-xl">Family</h2>
        <EntitySheet
          entityType="dependent"
          employeeId={employeeId}
          initialData={undefined} // add new
          recordId={undefined}
        />
      </div>

      {/* Table of dependents, with inline Edit */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead className="text-center">Beneficiary</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-md">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No dependents yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name || "N/A"}</TableCell>
                  <TableCell>{f.relationship || "N/A"}</TableCell>
                  <TableCell>{formatDob(f.dateOfBirth)}</TableCell>
                  <TableCell className="text-center">
                    {f.isBeneficiary ? "✓" : "—"}
                  </TableCell>
                  {/* Edit action */}
                  <TableCell className="text-center">
                    <EntitySheet
                      entityType="dependent"
                      employeeId={employeeId}
                      initialData={f}
                      recordId={f.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
