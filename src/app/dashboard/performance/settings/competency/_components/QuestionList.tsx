"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaQuestionCircle } from "react-icons/fa";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import QuestionModal from "./QuestionModal";
import {
  Competency,
  Question,
} from "@/types/performance/question-competency.type";

export default function QuestionList({
  competency,
  allCompetencies,
  activeId,
}: {
  competency?: Competency;
  allCompetencies: Competency[];
  activeId: string | null;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  const filtered: Question[] = useMemo(() => {
    const questions =
      activeId === "all"
        ? allCompetencies.flatMap((c) =>
            c.questions.map((q) => ({ ...q, _competencyName: c.name }))
          )
        : competency?.questions.map((q) => ({
            ...q,
            _competencyName: competency.name,
          })) ?? [];

    return questions.filter((q) =>
      q.question.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeId, allCompetencies, competency, search]);

  const columns: ColumnDef<Question & { _competencyName?: string }>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div>
          <p className="font-medium mb-1 text-xmd">{row.original.question}</p>
          <p className="text-sm text-muted-foreground">
            {row.original._competencyName}
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
          .replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      accessorKey: "isMandatory",
      header: "Mandatory",
      cell: ({ row }) => (row.original.isMandatory ? "Yes" : "No"),
    },
    {
      accessorKey: "allowNotes",
      header: "Allow Notes",
      cell: ({ row }) => (row.original.allowNotes ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.isGlobal ? (
            <Button size="sm" variant="link" disabled>
              <FaEdit />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="link"
                onClick={() => setEditing(row.original)}
              >
                <FaEdit />
              </Button>
              <DeleteIconDialog itemId={row.original.id} type="question" />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="col-span-2 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<FaQuestionCircle />}
          className="w-[400px]"
        />
        <Button onClick={() => setOpen(true)}>
          <FaCirclePlus className="mr-2" /> Add Question
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} />

      <QuestionModal open={open} setOpen={setOpen} />

      {editing && (
        <QuestionModal
          open={!!editing}
          setOpen={() => setEditing(null)}
          initialData={editing}
        />
      )}
    </div>
  );
}
