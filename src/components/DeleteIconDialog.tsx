"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDeleteMutation } from "@/hooks/useDeleteMutation";
import { FaTrash } from "react-icons/fa6";

type DeleteType =
  | "blocked-days"
  | "reserved-days"
  | "holidays"
  | "shifts"
  | "benefit-groups"
  | "benefits"
  | "expenses"
  | "assets"
  | "announcement"
  | "feedback-question"
  | "question"
  | "competency"
  | "performance-template"
  | "cycle"
  | "objective"
  | "attachment"
  | "goal-comment"
  | "feedback"
  | "expectation"
  | "appraisal-cycle"
  | "participant"
  | "types"
  | "reasons"
  | "checklist"
  | "keyResult";

type Props = {
  itemId: string;
  type: DeleteType;
};

const deleteConfigMap: Record<
  DeleteType,
  {
    endpoint: (id: string) => string;
    successMessage: string;
    refetchKey: string;
  }
> = {
  "blocked-days": {
    endpoint: (id) => `/api/blocked-days/${id}`,
    successMessage: "Item deleted",
    refetchKey: "blocked-days",
  },
  "reserved-days": {
    endpoint: (id) => `/api/reserved-days/${id}`,
    successMessage: "Reserved days deleted",
    refetchKey: "reserved-days",
  },
  holidays: {
    endpoint: (id) => `/api/holidays/delete-holiday/${id}`,
    successMessage: "Holiday deleted",
    refetchKey: "holidays",
  },
  shifts: {
    endpoint: (id) => `/api/shifts/${id}`,
    successMessage: "Shift deleted",
    refetchKey: "shifts",
  },
  "benefit-groups": {
    endpoint: (id) => `/api/benefit-groups/${id}`,
    successMessage: "Benefit group deleted",
    refetchKey: "benefit-groups",
  },
  benefits: {
    endpoint: (id) => `/api/benefit-plan/${id}`,
    successMessage: "Benefit deleted",
    refetchKey: "benefits",
  },
  expenses: {
    endpoint: (id) => `/api/expenses/${id}`,
    successMessage: "Expense deleted",
    refetchKey: "expenses",
  },
  assets: {
    endpoint: (id) => `/api/assets/${id}`,
    successMessage: "Asset deleted",
    refetchKey: "assets",
  },
  announcement: {
    endpoint: (id) => `/api/announcement/${id}`,
    successMessage: "Announcement deleted",
    refetchKey: "announcement",
  },
  "feedback-question": {
    endpoint: (id) => `/api/feedback-questions/${id}`,
    successMessage: "Feedback question deleted",
    refetchKey: "feedback-questions",
  },
  question: {
    endpoint: (id) => `/api/performance-seed/question/${id}`,
    successMessage: "Question deleted",
    refetchKey: "competencies",
  },
  competency: {
    endpoint: (id) => `/api/performance-seed/competency/${id}`,
    successMessage: "Competency deleted",
    refetchKey: "competencies",
  },
  "performance-template": {
    endpoint: (id) => `/api/templates/${id}`,
    successMessage: "Performance template deleted",
    refetchKey: "templates",
  },
  cycle: {
    endpoint: (id) => `/api/performance-cycle/${id}`,
    successMessage: "Performance cycle deleted",
    refetchKey: "current-cycle",
  },
  objective: {
    endpoint: (id) => `/api/performance-goals/${id}`,
    successMessage: "Performance goal deleted",
    refetchKey: "objectives-counts objectives",
  },
  attachment: {
    endpoint: (id) => `/api/performance-goals/attachments/${id}`,
    successMessage: "Attachment deleted",
    refetchKey: "goal",
  },
  "goal-comment": {
    endpoint: (id) => `/api/performance-goals/comments/${id}`,
    successMessage: "Comment deleted",
    refetchKey: "goal",
  },
  feedback: {
    endpoint: (id) => `/api/feedback/${id}`,
    successMessage: "Feedback deleted",
    refetchKey: "feedbacks",
  },
  expectation: {
    endpoint: (id) => `/api/performance-seed/role-expectations/${id}`,
    successMessage: "Expectation deleted",
    refetchKey: "framework-settings",
  },
  "appraisal-cycle": {
    endpoint: (id) => `/api/appraisals/cycle/${id}`,
    successMessage: "Appraisal cycle deleted",
    refetchKey: "appraisal-cycles",
  },
  participant: {
    endpoint: (id) => `/api/appraisals/${id}`,
    successMessage: "Participant deleted",
    refetchKey: "appraisal-participants",
  },
  types: {
    endpoint: (id) => `/api/offboarding-config/type/${id}`,
    successMessage: "Termination type deleted",
    refetchKey: "offboarding-config",
  },
  reasons: {
    endpoint: (id) => `/api/offboarding-config/reason/${id}`,
    successMessage: "Termination reason deleted",
    refetchKey: "offboarding-config",
  },
  checklist: {
    endpoint: (id) => `/api/offboarding-config/checklist/${id}`,
    successMessage: "Checklist item deleted",
    refetchKey: "offboarding-config",
  },
  keyResult: {
    endpoint: (id) => `/api/performance-goals/key-result/${id}`,
    successMessage: "Key Result deleted",
    refetchKey: "objective-summary",
  },
};

export const DeleteIconDialog = ({ itemId, type }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const config = deleteConfigMap[type];

  const deleteMutation = useDeleteMutation({
    endpoint: config.endpoint(itemId),
    successMessage: config.successMessage,
    refetchKey: config.refetchKey,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    setDisabled(true);
    try {
      await deleteMutation();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
      setDisabled(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="link"
          size="icon"
          disabled={disabled || isDeleting}
          className="text-monzo-error"
        >
          <FaTrash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-monzo-error hover:bg-monzo-error/90 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
