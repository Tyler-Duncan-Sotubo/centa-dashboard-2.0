"use client";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateComment } from "../hooks/use-create-comment";

type CommentFormProps = {
  announcementId: string;
};

export default function CommentForm({ announcementId }: CommentFormProps) {
  const { comment, setComment, isSubmitting, submit, canSubmit } =
    useCreateComment(announcementId);

  return (
    <div className="mt-6">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="mb-4 h-28 resize-none"
      />
      <div className="flex justify-end">
        <Button
          isLoading={isSubmitting}
          disabled={!canSubmit}
          onClick={submit}
          type="button"
        >
          Submit Comment
        </Button>
      </div>
    </div>
  );
}
