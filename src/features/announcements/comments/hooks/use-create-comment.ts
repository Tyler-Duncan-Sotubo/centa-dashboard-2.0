"use client";

import { useCallback, useMemo, useState } from "react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";

export function useCreateComment(announcementId: string) {
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
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const submit = useCallback(async (): Promise<void> => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    await sendComment({ comment: comment.trim() });
  }, [comment, sendComment]);

  return useMemo(
    () => ({
      comment,
      setComment,
      isSubmitting,
      submit,
      canSubmit: comment.trim().length > 0,
    }),
    [comment, isSubmitting, submit],
  );
}
