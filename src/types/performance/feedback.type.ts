export interface Feedback {
  isArchived: boolean;
  id: string;
  employee: string;
  departmentName: string;
  content: string;
  type:
    | "self"
    | "peer"
    | "manager_to_employee"
    | "employee_to_manager"
    | "archived";
  createdAt: string;
  employeeName: string;
  jobRoleName: string;
  senderName: string;
  questionsCount: number;
  responses: {
    answer: string;
    questionText: string;
    inputType: string;
  }[];
  isAnonymous: boolean;
  submittedAt: string;
}
