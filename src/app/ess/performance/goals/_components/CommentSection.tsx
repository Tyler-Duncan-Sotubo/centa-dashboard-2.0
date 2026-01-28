import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { useForm } from "react-hook-form";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Button } from "@/shared/ui/button";

type CommentFormData = {
  comment: string;
  isPrivate: boolean;
};

interface CommentSectionProps {
  goalId: string | number;
  status: string;
}

export function CommentSection({ goalId, status }: CommentSectionProps) {
  const { register, handleSubmit } = useForm<CommentFormData>({
    defaultValues: { comment: "", isPrivate: false },
  });

  const addComment = useCreateMutation({
    endpoint: `/api/performance-goals/${goalId}/comments`,
    successMessage: "Comment added successfully",
    refetchKey: "goal",
  });

  const onSubmit = (data: CommentFormData) => {
    addComment(data);
  };

  const handleSubmitComment = handleSubmit(onSubmit);

  return (
    <div className="space-y-4 pt-4">
      <Textarea
        {...register("comment")}
        placeholder="Write a comment..."
        required
        className="resize-none h-60 focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-2">
        <Checkbox id="isPrivate" {...register("isPrivate")} />
        <Label htmlFor="isPrivate">Private comment</Label>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSubmitComment}
          className="w-52"
          disabled={status === "archived" || status === "draft"}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
}
