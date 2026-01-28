"use client";

import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { format } from "date-fns";
import CommentReactionButton from "./comment-reaction-button";

export default function CommentCard({ comment }: any) {
  return (
    <div className="border rounded p-4 bg-white shadow-xs flex space-x-4 w-full items-start">
      <div>
        {comment.avatarUrl ? (
          <Image
            src={comment.avatarUrl}
            alt={comment.createdBy}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-800">{comment.createdBy}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(comment.createdAt), "PPPpp")}
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed mb-2">{comment.comment}</p>
        <CommentReactionButton
          commentId={comment.id}
          userReactions={comment.reactions || []}
        />
      </div>
    </div>
  );
}
