"use client";

import { useMemo, useState } from "react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import {
  totalFromReactionArray,
  reactionMap,
  reactionOptions,
} from "../../lib/reactions";
import { CommentReaction } from "../../types/comments.types";

export function useCommentReaction(
  commentId: string,
  userReactions: CommentReaction[],
) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const createReaction = useCreateMutation({
    endpoint: `/api/announcement/comment/${commentId}/reaction`,
    successMessage: "Reaction updated successfully",
    refetchKey: "announcement-detail announcement",
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
    },
    onError: () => setLoading(false),
  });

  const react = async (reactionType: string) => {
    setLoading(true);
    await createReaction({ reactionType });
  };

  const totalReactions = totalFromReactionArray(userReactions);

  return useMemo(
    () => ({
      loading,
      open,
      setOpen,
      react,
      totalReactions,
      reactionMap,
      reactionOptions,
    }),
    [loading, open, totalReactions],
  );
}
