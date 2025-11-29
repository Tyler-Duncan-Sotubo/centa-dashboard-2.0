"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaQuestionCircle } from "react-icons/fa";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import AssignQuestionsModal from "./AssignQuestionsModal";
import { DeleteWithTwoIdsDialog } from "@/components/DeleteWithTwoIdsDialog";

type Question = {
  id: string;
  question: string;
  type: string;
  isMandatory: boolean;
  competencyId: string;
  competencyName: string;
};

type Props = {
  templateId: string;
  questions: Question[];
};

export default function TemplateQuestionList({ templateId, questions }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return questions.filter((q) =>
      q.question.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, questions]);

  const columns: ColumnDef<Question>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.question}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.competencyName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) =>
        row.original.type
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    {
      accessorKey: "isMandatory",
      header: "Mandatory",
      cell: ({ row }) => (row.original.isMandatory ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <DeleteWithTwoIdsDialog
            id1={templateId}
            id2={row.original.id}
            buildEndpoint={(templateId, questionId) =>
              `/api/templates/${templateId}/questions/${questionId}`
            }
            successMessage="Question removed successfully"
            refetchKey="template-questions"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 col-span-2">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<FaQuestionCircle />}
          className="w-[400px]"
        />
        <Button onClick={() => setOpen(true)}>
          <FaCirclePlus className="mr-2" /> Assign Questions
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} />

      <AssignQuestionsModal
        open={open}
        setOpen={setOpen}
        templateId={templateId}
      />
    </div>
  );
}
