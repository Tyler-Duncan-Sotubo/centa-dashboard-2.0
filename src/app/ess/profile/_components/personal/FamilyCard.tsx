import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { EntitySheet } from "../EntitySheet";

export function FamilyCard({
  family,
  employeeId,
}: {
  family: Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    isBeneficiary: boolean;
  }>;
  employeeId: string; // This prop is not used in the component but can be useful for context
}) {
  return (
    <div className="bg-white rounded-lg p-6 border">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold text-xl">Family</h2>
        <EntitySheet
          entityType="dependent"
          employeeId={employeeId}
          initialData={undefined} // no data → add new
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
            {family.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.relationship}</TableCell>
                <TableCell>{f.dateOfBirth}</TableCell>
                <TableCell className="text-center">
                  {f.isBeneficiary ? "✓" : "—"}
                </TableCell>
                {/* Edit action cell */}
                <TableCell className="text-center">
                  <EntitySheet
                    entityType="dependent"
                    employeeId="123"
                    initialData={f}
                    recordId={f.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
