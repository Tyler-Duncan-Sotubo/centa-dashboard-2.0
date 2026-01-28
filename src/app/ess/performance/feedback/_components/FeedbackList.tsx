"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { FaEye, FaTrash } from "react-icons/fa";
import { Avatars } from "@/shared/ui/avatars";
import { Feedback } from "@/types/performance/feedback.type";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import ViewFeedbackModal from "./ViewFeedbackModal";
import { useState } from "react";
import { FeedbackMobileRow } from "./feedback-mobile-row";

type Props = {
  feedbacks: Feedback[];
  disabledAction?: boolean;
};

export default function FeedbackList({ feedbacks, disabledAction }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );

  const openView = (id: string) => {
    setSelectedFeedbackId(id);
    setOpen(true);
  };

  const columns: ColumnDef<Feedback>[] = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }) =>
        row.original.type === "self" ? (
          "Your Feedback"
        ) : (
          <div className="flex items-center gap-3">
            <div>{Avatars({ name: row.original.employeeName })}</div>
            <div className="flex flex-col">
              <Button
                variant="link"
                className="p-0 h-auto text-xmd"
                type="button"
                onClick={() => openView(row.original.id)}
              >
                {row.original.employeeName}
              </Button>
              <div className="capitalize font-medium text-xs text-muted-foreground ml-1">
                {row.original.jobRoleName || "No Job Role"}
              </div>
            </div>
          </div>
        ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize font-medium">
          {row.original.type.replaceAll("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "questionsCount",
      header: "# of Questions",
      cell: ({ row }) => (
        <span className="capitalize font-medium">
          {row.original.questionsCount}
        </span>
      ),
    },
    {
      accessorKey: "senderName",
      header: "Submitted By",
      cell: ({ row }) => <p>{row.original.senderName}</p>,
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted On",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const feedback = row.original;
        return (
          <div className="flex items-center">
            <Button
              size="sm"
              variant="link"
              type="button"
              onClick={() => openView(feedback.id)}
            >
              <FaEye className="mr-1" />
            </Button>

            {!disabledAction && row.original.type === "self" ? (
              <DeleteIconDialog itemId={feedback.id} type="feedback" />
            ) : (
              <Button
                variant="link"
                size="sm"
                disabled={disabledAction}
                className="cursor-help"
              >
                <FaTrash className="mr-1 text-monzo-error " />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={feedbacks}
        mobileRow={(props) => (
          <FeedbackMobileRow
            {...props}
            disabledAction={disabledAction}
            onView={openView}
          />
        )}
      />

      {open && selectedFeedbackId && (
        <ViewFeedbackModal
          open={open}
          onClose={() => setOpen(false)}
          id={selectedFeedbackId}
        />
      )}
    </>
  );
}
