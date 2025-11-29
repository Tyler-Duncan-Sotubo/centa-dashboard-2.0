"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import PageHeader from "@/components/pageHeader";
import { FaEdit } from "react-icons/fa";
import { RichTextEditor } from "@/components/RichTextEditor";
import RenderHtml from "@/components/ui/render-html";

type CommentFormProps = {
  name: string; // e.g., "questionnaireComment"
  comment?: string; // Optional initial comment
  assessmentId: string;
};

export default function CommentForm({
  name,
  assessmentId,
  comment = "",
}: CommentFormProps) {
  const [value, setValue] = useState(comment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!comment);

  const submitComment = useCreateMutation({
    endpoint: `/api/performance-assessments/${assessmentId}/submit`,
    successMessage: "Comment saved successfully",
    refetchKey: "assessment",
  });

  const handleSubmit = async () => {
    if (!value.trim()) return;

    setIsSubmitting(true);
    try {
      await submitComment({ [name]: value });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 mt-10">
      {isEditing ? (
        <>
          <PageHeader
            title={comment ? "Edit Comment" : "Add Comment"}
            description={
              comment
                ? "You are currently editing your comment. Please save or cancel your changes."
                : "Add your comment below."
            }
          >
            {comment && (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            )}
          </PageHeader>
          <RichTextEditor value={value} onChange={setValue} />
          <div className="flex justify-end">
            <Button
              onClick={() => {
                handleSubmit();
                setIsEditing(false); // Exit editing mode after saving
              }}
              disabled={isSubmitting || !value.trim()}
            >
              {isSubmitting ? "Saving..." : "Save Comment"}
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Comment</h3>
            <Button onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit
            </Button>
          </div>
          <RenderHtml html={value} />
        </div>
      )}
    </div>
  );
}
