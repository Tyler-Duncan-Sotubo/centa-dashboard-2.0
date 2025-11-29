export type TerminationSession = {
  id: string;
  employeeName: string;
  status: string;
  startedAt: string;
  terminationType?: string;
  terminationReason?: string;
};

export type OffboardingSession = {
  id: string;
  employeeName: string;
  jobRole: string;
  department: string;
  terminationType: string;
  terminationReason: string;
  status: "pending" | "in_progress" | "completed";
  checklist: {
    name: string;
    completed: boolean;
    id: string; // Unique ID for the checklist item
  }[];
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
};
