import { Feedback } from "@/types/performance/feedback.type";
import CommentForm from "./CommentForm";
import FeedbackList from "../../feedback/_components/FeedbackList";

export default function FeedbackSection({
  feedback,
  assessmentId,
  comment,
}: {
  feedback: Feedback[];
  assessmentId: string;
  comment: string;
}) {
  if (!feedback.length) {
    return (
      <p className="text-sm text-muted-foreground">No feedback submitted.</p>
    );
  }
  return (
    <div>
      <h2 className="text-lg font-semibold">
        Feedback from your peers and managers.
      </h2>
      <FeedbackList feedbacks={feedback} disabledAction />
      <CommentForm
        name="feedbackComment"
        assessmentId={assessmentId}
        comment={comment}
      />
    </div>
  );
}
