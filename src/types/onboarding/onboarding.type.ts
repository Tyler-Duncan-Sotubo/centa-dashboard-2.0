export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  isGlobal: boolean;
  companyId: string | null;
  createdAt: string;
  fieldCount: number;
  checklistCount: number;
}

export interface GlobalTemplate {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  isGlobal: boolean;
  companyId: string | null;
  createdAt: string;
}

export interface TemplatesResponse {
  templateSummaries: TemplateSummary[] | undefined;
  globalTemplates: GlobalTemplate[] | undefined;
}

export type ChecklistItem = {
  id: string;
  title: string;
  order: number;
  dueDaysAfterStart: number;
  status?: "completed" | "pending"; // Optional now
};

export type OnboardingEmployee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  employeeName: string;
  email: string;
  templateId: string;
  status: "pending" | "in_progress" | "completed";
  startedAt: string;
  checklist: ChecklistItem[];
};
