"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMutation } from "@/hooks/useCreateMutation";

interface CommentFormProps {
  announcementId: string;
}

export default function CommentForm({ announcementId }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendComment = useCreateMutation({
    endpoint: `/api/announcement/${announcementId}/comment`,
    successMessage: "Comment added successfully",
    refetchKey: "announcement-detail",
    onSuccess: () => {
      setComment("");
      setIsSubmitting(false);
    },
  });

  const handleSendComment = async () => {
    setIsSubmitting(true);
    await sendComment({
      comment: comment,
    });
  };

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
          disabled={!comment}
          onClick={() => handleSendComment()}
        >
          Submit Comment
        </Button>
      </div>
    </div>
  );
}
