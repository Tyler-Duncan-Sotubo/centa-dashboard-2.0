/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Goal } from "@/types/performance/goals.type";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { GoDotFill } from "react-icons/go";
import Image from "next/image";
import { FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { DeleteIconDialog } from "@/components/DeleteIconDialog";
import { AttachmentModal } from "./AttachmentModal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface ActivityFeedProps {
  goal: Goal;
}

// Define a type for timeline items
type TimelineItem =
  | (NonNullable<Goal["updates"]>[number] & { type: "Update" })
  | (NonNullable<Goal["comments"]>[number] & { type: "Comment" })
  | (NonNullable<Goal["attachments"]>[number] & { type: "Attachment" });

const ActivityFeed: React.FC<ActivityFeedProps> = ({ goal }) => {
  // State for editing comment/attachment
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<string | null>(
    null
  );

  // Handle comment/attachment editing
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditedText(item.comment || item.fileName);
  };

  const saveComment = useUpdateMutation({
    endpoint: `/api/performance-goals/comments/${editingItem?.id}`,
    successMessage: "Comment updated successfully",
    refetchKey: "goal",
    onSuccess: () => {
      setEditingItem(null);
      setEditedText("");
    },
  });

  // Handle saving the edited item
  const handleSaveEdit = () => {
    if (editingItem) {
      saveComment({
        comment: editedText,
      });
    }
  };

  const getCombinedTimeline = (goal: Goal) => {
    const updates =
      goal.updates?.map((u: any) => ({
        ...u,
        type: "Update",
      })) || [];

    const comments =
      goal.comments?.map((c: any) => ({
        ...c,
        type: "Comment",
      })) || [];

    const attachments =
      goal.attachments?.map((a: any) => ({
        ...a,
        type: "Attachment",
      })) || [];

    return [...updates, ...comments, ...attachments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const timeline = getCombinedTimeline(goal);

  // Render the activity feed
  return (
    <div className="lg:col-span-1 space-y-6">
      <div>
        <div className="space-y-6">
          <Accordion
            type="multiple"
            className="space-y-2"
            defaultValue={timeline.length ? [timeline[0].id.toString()] : []}
          >
            {getCombinedTimeline(goal).map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id.toString()}
                className="border rounded-lg bg-muted/30"
              >
                <AccordionTrigger className="flex items-center justify-between gap-3 px-4 py-3 font-medium text-left">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "MMMM dd, yyyy hh:mm a")}
                    <GoDotFill />
                    <span className="text-monzo-error font-semibold">
                      {item.type}
                    </span>
                    {item.type === "Update" && (
                      <span className="ml-3 font-medium text-monzo-monzoGreen">
                        {item.progress}%
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  {/* Your existing detail rendering goes here, unchanged */}
                  {item.type === "Update" && (
                    <>
                      <Progress
                        value={item.progress}
                        max={100}
                        className="my-2"
                      />
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">
                          Progress: {item.progress}%
                        </p>
                        <p className="text-xs">
                          Created By: {item.createdByName}
                        </p>
                      </div>
                      {item.note && <p>{item.note}</p>}
                    </>
                  )}

                  {item.type === "Comment" && (
                    <div className="space-y-2 group">
                      {editingItem?.id === item.id ? (
                        <div className="space-y-2 mt-5">
                          <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full border p-2 rounded"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setEditingItem(null)}
                              className="bg-monzo-error"
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSaveEdit}>Save</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold">{item.comment}</p>
                          <p className="text-xs text-right">
                            Created By: {item.createdByName}
                          </p>
                          <div className="flex justify-end">
                            <Button
                              variant={"link"}
                              size="icon"
                              onClick={() => handleEdit(item)}
                              className="p-0"
                            >
                              <FaEdit />
                            </Button>
                            <DeleteIconDialog
                              itemId={item.id}
                              type="goal-comment"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {item.type === "Attachment" && (
                    <>
                      <p className="font-medium">{item.comment}</p>
                      {isImage(item.fileUrl) ? (
                        <div className="my-2">
                          <Image
                            src={item.fileUrl}
                            alt={item.fileName}
                            width={300}
                            height={300}
                            className="rounded-lg"
                          />
                        </div>
                      ) : (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          className="text-blue-600 text-sm underline"
                        >
                          {item.fileName}
                        </a>
                      )}
                      <p className="text-xs text-right">
                        Created By: {item.uploadedByName}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant={"link"}
                          size="icon"
                          onClick={() => {
                            setEditingAttachment(item.id);
                            setIsOpen(true);
                          }}
                          className="p-0"
                        >
                          <FaEdit />
                        </Button>
                        <DeleteIconDialog itemId={item.id} type="attachment" />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <AttachmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        goalId={goal.id}
        id={editingAttachment as string | undefined}
      />
    </div>
  );
};

export default ActivityFeed;
