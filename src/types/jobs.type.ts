// Define JobType enum or import it from another file if already defined elsewhere
export type JobType = "onsite" | "remote" | "hybrid";

// Define EmploymentType enum or type
export type EmploymentType =
  | "permanent"
  | "temporary"
  | "contract"
  | "internship"
  | "freelance"
  | "part_time"
  | "full_time";

export interface Job {
  id: string;
  pipelineTemplateId: string;
  title: string;
  department?: string;
  country?: string;
  state?: string;
  city?: string;
  jobType: JobType;
  employmentType: EmploymentType;
  salaryRange: string;
  currency: string;
  experienceLevel?: string;
  yearsOfExperience?: string;
  qualification?: string;
  description?: string;
  requirements?: string;
  externalJobId?: string;
  postedAt?: string;
  closedAt?: string;
  deadlineDate?: string;
  createdAt: string;
  location?: string;
  status: "draft" | "open" | "closed" | "archived";
}
