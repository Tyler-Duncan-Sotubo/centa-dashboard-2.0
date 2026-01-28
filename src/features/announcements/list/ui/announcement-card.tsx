import { Card } from "@/shared/ui/card";
import { format } from "date-fns";
import { Eye, MessageCircle } from "lucide-react";
import { FaUserCircle, FaRegSmile } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { Announcement } from "../../types/announcements.types";
import { stripHtml, truncateWords } from "../../lib/text";
import { formatRole } from "../../lib/role";

export default function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  const router = useRouter();

  const plainText = stripHtml(announcement.body);
  const previewText = truncateWords(plainText, 50);

  const reactionMap: Record<string, string> = {
    like: "👍",
    celebrate: "🎉",
    love: "❤️",
    happy: "😄",
    clap: "👏",
    sad: "😢",
    angry: "😡",
  };

  const reactions = announcement.reactionCounts; // assuming object structure

  // Convert to array & parse count to number
  const reactionArray = Object.entries(reactions).map(([type, count]) => ({
    type,
    count: Number(count), // ✅ convert string or number to number
  }));

  // Total count
  const totalCount = reactionArray.reduce((sum, r) => sum + r.count, 0);

  // Sort by count (optional, to show most frequent reactions first)
  const sortedReactions = reactionArray.sort((a, b) => b.count - a.count);

  // Pick top 2
  const topReactions = sortedReactions.slice(0, 2);

  return (
    <Card className="p-4 border rounded-md shadow-md bg-white">
      {/* Header */}
      <div className="flex justify-between mb-3">
        {/* Left side: avatar, name, role, date */}
        <div className="flex items-center space-x-2">
          <div>
            {announcement.avatarUrl ? (
              <Image
                src={announcement.avatarUrl}
                alt={announcement.createdBy}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium">{announcement.createdBy}</div>
            <div className="flex items-center space-x-1">
              <div className="text-sm">{formatRole(announcement.role)}</div>
              <span className="text-gray-400">•</span>
              <div className="text-sm">
                {format(new Date(announcement.publishedAt), "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: edit and more */}
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              router.push(`/dashboard/announcement/${announcement.id}/edit`)
            }
          >
            <MdEdit className="w-5 h-5 text-gray-500 hover:text-blue-500" />
          </Button>
          <DeleteIconDialog itemId={announcement.id} type="announcement" />
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
          {announcement.category}
        </span>
      </div>

      {/* Title & Body */}
      <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
      <p className="text-gray-600 mb-3 leading-relaxed text-md">
        {previewText}
      </p>

      {/* Reactions Summary */}
      <div className="flex justify-between text-sm text-gray-500 mt-6 mb-3">
        <div className="flex items-center space-x-2 text-md">
          {totalCount === 0 ? (
            <FaRegSmile className="w-5 h-5 text-gray-400" />
          ) : (
            <>
              {topReactions.map((r) => (
                <span key={r.type}>
                  {reactionMap[r.type]} {r.count}
                </span>
              ))}
            </>
          )}
          <span className="text-gray-500 ml-2">
            {totalCount} Reaction{totalCount !== 1 && "s"}
          </span>
        </div>
        <span>
          {announcement.commentCount}{" "}
          {announcement.commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Separator */}
      <hr className="my-3" />

      {/* Bottom Action Buttons */}
      <div className="flex justify-between items-center text-sm py-2">
        <div className="flex justify-between items-center text-sm space-x-4">
          <button
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            onClick={() =>
              router.push(`/dashboard/announcement/${announcement.id}`)
            }
          >
            <FaRegSmile className="w-5 h-5" /> <span>React</span>
          </button>
          <button
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            onClick={() =>
              router.push(`/dashboard/announcement/${announcement.id}`)
            }
          >
            <MessageCircle className="w-5 h-5" /> <span>Comment</span>
          </button>
        </div>

        <button
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
          onClick={() =>
            router.push(`/dashboard/announcement/${announcement.id}`)
          }
        >
          <Eye className="w-5 h-5" /> <span>View Full Post</span>
        </button>
      </div>
    </Card>
  );
}
