export type ReviewStatus =
  | "submitted"
  | "in_progress"
  | "not_started"
  | "overdue"
  | "draft"
  | "archived"
  | "all";

export type Review = {
  id: string;
  employee: string;
  reviewer: string;
  type: string;
  status: ReviewStatus;
  score: number | null;
  progress: number;
  dueDate: string | null;
  createdAt: string;
  submittedAt: string | null;
  departmentName: string;
  jobRoleName: string; // Optional field for job role name
  reviewerName: string;
  revieweeName: string;
  questions: {
    id: string;
    question: string;
    answer: string;
    rating: number | null;
    response: string | null;
    type: "rating" | "yes_no";
    questionId: string;
  }[];
};
