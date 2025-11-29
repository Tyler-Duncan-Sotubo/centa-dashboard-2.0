import CommentForm from "./CommentForm";
import GoalList from "../../goals/_components/GoalList";
import { Goal } from "@/types/performance/goals.type";

interface GoalsSectionProps {
  goals: Goal[];
  assessmentId: string;
  comment?: string; // Optional initial comment
}

export default function GoalsSection({
  goals,
  assessmentId,
  comment,
}: GoalsSectionProps) {
  if (!goals.length) {
    return <p className="text-sm text-muted-foreground">No goals assigned.</p>;
  }
  return (
    <div>
      <h2 className="text-lg font-semibold">Goals Summary</h2>
      <GoalList goals={goals} disabledAction />
      <CommentForm
        name="goalsComment"
        assessmentId={assessmentId}
        comment={comment}
      />
    </div>
  );
}
