export type Field = {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: "text" | "date" | "select" | "file";
  required: boolean;
  tag: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  order: number;
  status: "pending" | "in_progress" | "completed";
  fields: Field[];
};

export type EmployeeOnboarding = {
  employeeId: string;
  employeeName: string;
  email: string;
  templateId: string;
  status: string;
  startedAt: string;
  checklist: ChecklistItem[];
};
