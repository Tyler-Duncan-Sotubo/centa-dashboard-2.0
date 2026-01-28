"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { FaRegSmile } from "react-icons/fa";
import { useCommentReaction } from "../hooks/use-comment-reaction";
import { CommentReaction } from "../../types/comments.types";

type CommentReactionButtonProps = {
  commentId: string;
  userReactions: CommentReaction[];
};

export default function CommentReactionButton({
  commentId,
  userReactions,
}: CommentReactionButtonProps) {
  const {
    react,
    loading,
    open,
    setOpen,
    totalReactions,
    reactionMap,
    reactionOptions,
  } = useCommentReaction(commentId, userReactions);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center space-x-1 text-gray-600"
          disabled={loading}
          type="button"
        >
          {totalReactions === 0 ? (
            <FaRegSmile className="w-5 h-5 text-gray-400" />
          ) : (
            <span>
              {userReactions.map((item) => (
                <span key={item.reactionType}>
                  {reactionMap[item.reactionType]}
                </span>
              ))}{" "}
            </span>
          )}

          <span>
            {totalReactions} Reaction{totalReactions !== 1 && "s"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="flex space-x-2 p-3">
        {reactionOptions.map((reaction) => (
          <button
            key={reaction.type}
            className="text-2xl hover:scale-125 transition"
            onClick={() => react(reaction.type)}
            type="button"
          >
            {reaction.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
