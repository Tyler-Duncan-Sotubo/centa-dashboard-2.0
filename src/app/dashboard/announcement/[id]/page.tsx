"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { RichTextViewer } from "@/components/ui/RichTextViewer"; // we'll render HTML safely
import { FaChevronCircleLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CommentForm from "../_components/CommentForm";
import CommentCard from "../_components/CommentCard";
import ReactionButton from "../_components/ReactionButton";
import useAxiosAuth from "@/hooks/useAxiosAuth";

interface Comment {
  id: string;
  createdBy: string;
  avatarUrl?: string;
  comment: string;
  createdAt: string;
  reactions?: {
    reactionType: string;
    count: string;
  }[];
}

export default function AnnouncementDetailPage() {
  const axiosAuth = useAxiosAuth();
  const { id } = useParams();
  const { data: session } = useSession();

  const fetchAnnouncement = async () => {
    try {
      const res = await axiosAuth.get(`/api/announcement/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return null;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcement-detail", id],
    queryFn: fetchAnnouncement,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading || !data) return <Loading />;
  if (isError) return <div>Error loading announcement</div>;

  const { announcement, likeCount, likedByCurrentUser, comments } = data;

  return (
    <div className="max-w-4xl p-5">
      <Link href="/dashboard/announcement">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft />
          Back to Announcements
        </Button>
      </Link>

      <section className="bg-white p-6 rounded-lg shadow mb-10">
        <h1 className="text-3xl font-bold mb-3">{announcement.title}</h1>

        {announcement.publishedAt && (
          <p className="text-gray-500 mb-4">
            Published: {format(new Date(announcement.publishedAt), "PPP")}
          </p>
        )}

        {/* Render Body safely */}
        <div className="prose prose-md mb-10 rich-text-viewer">
          <RichTextViewer html={announcement.body} />
        </div>

        {/* Reactions + Comment Summary */}
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

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Discussion about this post</h2>
        {comments.length === 0 && (
          <p className="text-gray-500">No comments yet.</p>
        )}

        {comments.map((comment: Comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}

        <CommentForm announcementId={announcement.id} />
      </div>
    </div>
  );
}
