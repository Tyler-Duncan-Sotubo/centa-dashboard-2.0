export interface AppraisalCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "closed";
}

export type Appraisal = {
  id: string;
  employeeId: string;
  managerId: string;
  cycleId: string;
  employeeName: string;
  managerName: string;
  submittedByEmployee: boolean;
  submittedByManager: boolean;
  finalized: boolean;
  finalScore?: number | null;
  departmentName?: string;
  jobRoleName?: string;
};

export interface AppraisalEntry {
  appraisalId: string;
  competencyId: string;
  competencyName: string;
  expectedLevelId: string;
  expectedLevelName: string;

  employeeLevelId: string | null;
  managerLevelId: string | null;

  notes?: string | null;
}
