export type Competency = {
  id: string;
  companyId: string | null;
  name: string;
  description: string;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  questions: Question[];
};

export type Question = {
  id: string;
  companyId: string | null;
  competencyId: string;
  question: string;
  type: "text" | "rating" | "yes_no" | "dropdown" | "checkbox";
  isMandatory: boolean;
  allowNotes: boolean;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  response?: string | number | boolean | string[]; // Response can vary based on question type
};
