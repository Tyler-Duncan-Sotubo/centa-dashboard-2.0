"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { FaChevronCircleLeft } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import { RichTextViewer } from "@/shared/ui/RichTextViewer";

import { useAnnouncementDetail } from "../hooks/use-announcement-detail";

// Use your feature-based components if you moved them already:
import CommentForm from "@/features/announcements/comments/ui/comment-form";
import CommentCard from "@/features/announcements/comments/ui/comment-card";
import ReactionButton from "../../reactions/reaction-button";

export function AnnouncementDetailView() {
  const pathname = usePathname();
  const { data, isLoading, isError } = useAnnouncementDetail();

  if (isLoading || !data) return <Loading />;
  if (isError) return <div>Error loading announcement</div>;

  const { announcement, likeCount, likedByCurrentUser, comments } = data;

  const essPath = pathname.includes("/ess");

  return (
    <div className={`max-w-4xl ${essPath ? "mb-10" : "p-5"}`}>
      {essPath ? (
        <Link href="/ess">
          <Button variant="link" className="px-0 text-md mb-5">
            <FaChevronCircleLeft />
            Back to Home
          </Button>
        </Link>
      ) : (
        <Link href="/dashboard/announcement">
          <Button variant="link" className="px-0 text-md mb-5">
            <FaChevronCircleLeft />
            Back to Announcements
          </Button>
        </Link>
      )}

      <section className="bg-white p-6 rounded-lg shadow-xs mb-10">
        <h1 className="text-3xl font-bold mb-3">{announcement.title}</h1>

        {announcement.publishedAt ? (
          <p className="text-gray-500 mb-4">
            Published: {format(new Date(announcement.publishedAt), "PPP")}
          </p>
        ) : null}

        <div className="prose prose-md mb-10 rich-text-viewer">
          <RichTextViewer html={announcement.body} />
        </div>

        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length} Comments</span>
            </div>

            <ReactionButton
              announcementId={announcement.id}
              reactionCounts={likeCount}
              userHasReacted={likedByCurrentUser}
            />
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Discussion about this post</h2>

        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : null}

        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}

        <CommentForm announcementId={announcement.id} />
      </div>
    </div>
  );
}
