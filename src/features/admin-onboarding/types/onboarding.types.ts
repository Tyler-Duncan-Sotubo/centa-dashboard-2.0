// ----- Types from backend -----
export type TaskStatus = "todo" | "inProgress" | "done" | "skipped" | "blocked";
export type ModuleBlob = {
  tasks: Record<string, TaskStatus>;
  required: string[];
  completed: boolean;
  disabledWhenComplete?: boolean;
};

// ----- Reusable component types -----
export type StepMetaItem = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  Component:
    | React.ComponentType<{ refresh: () => Promise<void> }>
    | React.ComponentType<any>;
};
