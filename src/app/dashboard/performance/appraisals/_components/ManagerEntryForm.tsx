"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppraisalEntry } from "@/types/performance/appraisal.type";
import { useState } from "react";
import { useCreateMutation } from "@/hooks/useCreateMutation";

interface Props {
  entries: AppraisalEntry[];
  levels: { id: string; name: string }[];
  appraisalId: string | null;
}

export default function ManagerEntryForm({
  entries,
  levels = [],
  appraisalId,
}: Props) {
  const [formData, setFormData] = useState<AppraisalEntry[]>(
    entries.map((entry) => ({
      ...entry,
      managerLevelId: entry.managerLevelId ?? "",
      notes: entry.notes ?? "",
    }))
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    id: string,
    field: keyof Pick<AppraisalEntry, "managerLevelId" | "notes">,
    value: string
  ) => {
    setFormData((prev) =>
      prev.map((entry) =>
        entry.competencyId === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addEntries = useCreateMutation({
    endpoint: `/api/appraisals/${appraisalId}/entries`,
    successMessage: "Entries saved successfully",
    onSuccess: () => {
      setIsLoading(false);
    },
    refetchKey: "appraisal-entries",
  });

  const handleSaveDraft = () => {
    setIsLoading(false);
    addEntries(formData);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    addEntries(formData);
  };

  return (
    <div className="space-y-6">
      {entries.length > 0 ? (
        <>
          {/* Table */}
          <div className="rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Competency</TableHead>
                  <TableHead className="w-1/4">Expected Level</TableHead>
                  <TableHead className="w-1/4">Your Level</TableHead>
                  <TableHead className="w-1/4">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.map((entry) => (
                  <TableRow key={entry.competencyId}>
                    <TableCell className="font-medium">
                      {entry.competencyName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.expectedLevelName}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={entry.managerLevelId ?? ""}
                        onValueChange={(val) =>
                          handleChange(
                            entry.competencyId,
                            "managerLevelId",
                            val
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.notes ?? ""}
                        placeholder="Add notes"
                        onChange={(e) =>
                          handleChange(
                            entry.competencyId,
                            "notes",
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end mt-4">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Submit Entries
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <p className="text-muted-foreground">
            No competencies found for this appraisal. Please check the role and
            expectations.
          </p>
        </div>
      )}
    </div>
  );
}
