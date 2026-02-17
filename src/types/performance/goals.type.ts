export type Goal = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  startDate: string;
  cycleId: string;
  weight: number;
  progress: number; // Overall progress percentage
  status: "draft" | "published" | "archived" | "active" | "pending_approval";
  kpiBased: boolean;
  type: string; // e.g., "personal", "team", "company"
  employee: string; // Full name of the employee
  employeeId: string;
  groupId: string;
  parentGoalId?: string; // Optional parent goal ID for sub-goals
  isArchived?: boolean;
  children?: Goal[]; // For hierarchical goals
  jobRoleName: string; // Optional job role name for filtering
  departmentName: string; // Optional department name for filtering
  departmentId: string; // Optional department ID for filtering
  assignedBy: string; // ID of the user who assigned the goal
  isPrivate?: boolean; // Whether the goal is private to the employee
  office: string; // Office location of the employee
  manager: string; // Full name of the manager
  avatarUrl: string; // URL to the employee's avatar
  isRecurring: boolean; // Whether the goal is recurring
  updates: {
    id: string;
    progress: number; // Progress percentage
    comment?: string; // Optional comment on the progress update
    createdAt: string; // ISO date string
    createdBy: string; // ID of the user who made the update
  }[];
  comments: {
    id: string;
    content: string; // Comment text
    authorId: string; // ID of the user who made the comment
    createdAt: string; // ISO date string
    isPrivate?: boolean; // Whether the comment is private
  }[];
  attachments: {
    id: string;
    fileName: string; // Name of the file
    fileUrl: string; // URL to access the file
    createdAt: string; // ISO date string
    createdBy: string; // ID of the user who uploaded the attachment
  }[];
};

export type UpdatesSectionProps = {
  updates: Goal["updates"];
  goalId: string;
};

export type CommentsSectionProps = {
  comments: Goal["comments"];
  goalId: string;
};

export type AttachmentsSectionProps = {
  attachments: Goal["attachments"];
  goalId: string;
};
