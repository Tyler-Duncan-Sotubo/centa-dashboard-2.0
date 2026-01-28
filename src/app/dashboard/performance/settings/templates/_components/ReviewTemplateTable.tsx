"use client";

import { useMemo, useState } from "react";
import { FaCheckCircle, FaEdit, FaTimesCircle } from "react-icons/fa";
import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ReviewTemplate } from "./PerformanceTemplates";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { Button } from "@/shared/ui/button";
import ReviewTemplateModal from "./ReviewTemplateModal";
import { useRouter } from "next/navigation";
import { BsQuestionSquareFill } from "react-icons/bs";

export default function ReviewTemplateTable({
  templates,
}: {
  templates: ReviewTemplate[] | undefined;
}) {
  const router = useRouter();
  const booleanIcon = (value: boolean) =>
    value ? (
      <FaCheckCircle className="text-green-500" />
    ) : (
      <FaTimesCircle className="text-red-500" />
    );

  const centeredCell = (value: boolean) => (
    <div className="flex items-center justify-center">{booleanIcon(value)}</div>
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<ReviewTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const columns: ColumnDef<ReviewTemplate>[] = [
    {
      accessorKey: "name",
      header: "Template Name",
      cell: ({ row }) => {
        return <div className="py-3 text-xmd">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="py-3 text-xmd">{row.original.description}</div>;
      },
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) => centeredCell(row.original.isDefault),
    },
    {
      accessorKey: "includeGoals",
      header: "Goals",
      cell: ({ row }) => centeredCell(row.original.includeGoals),
    },
    {
      accessorKey: "includeAttendance",
      header: "Attendance",
      cell: ({ row }) => centeredCell(row.original.includeAttendance),
    },
    {
      accessorKey: "includeFeedback",
      header: "Feedback",
      cell: ({ row }) => centeredCell(row.original.includeFeedback),
    },
    {
      accessorKey: "includeQuestionnaire",
      header: "Questionnaire",
      cell: ({ row }) => centeredCell(row.original.includeQuestionnaire),
    },
    {
      accessorKey: "requireSignature",
      header: "Signature",
      cell: ({ row }) => centeredCell(row.original.requireSignature),
    },
    {
      accessorKey: "restrictVisibility",
      header: "Restricted?",
      cell: ({ row }) => centeredCell(row.original.restrictVisibility),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="link"
            size="icon"
            onClick={() => {
              setSelectedTemplate(row.original);
              setIsOpen(true);
            }}
          >
            <FaEdit />
          </Button>
          <Button
            variant="link"
            size="icon"
            onClick={() =>
              router.push(
                `/dashboard/performance/settings/templates/${row.original.id}`,
              )
            }
            title="Edit Questions"
          >
            <BsQuestionSquareFill />
          </Button>
          <DeleteIconDialog
            itemId={row.original.id}
            type="performance-template"
          />
        </div>
      ),
    },
  ];

  const data = useMemo(() => templates, [templates]);

  return (
    <>
      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
      <ReviewTemplateModal
        open={isOpen}
        setOpen={setIsOpen}
        initialData={selectedTemplate}
      />
    </>
  );
}
