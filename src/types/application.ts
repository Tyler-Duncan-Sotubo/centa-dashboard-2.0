/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApplicationDetails {
  application: Application;
  candidate: Candidate;
  fieldResponses: FieldResponse[];
  questionResponses: QuestionResponse[];
  stageHistory: StageHistory[];
  interview: {
    id: string;
    stage: string;
    scheduledFor: string;
    durationMins: number;
    status: string;
    eventId?: string; // Optional field for Google Calendar integration
    mode: string;
    meetingLink?: string;
    interviewers: InterviewerWithScorecard[];
  } | null;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  source: string;
  status: string;
  appliedAt: string;
  currentStage: string;
  resumeScore: ResumeScore | null;
  metadata: any;
}

export interface ResumeScore {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  resumeUrl: string;
  profile: any;
  createdAt: string;
  updatedAt: string;
}

export interface FieldResponse {
  label: string;
  value: string | number;
}

export interface QuestionResponse {
  question: string;
  answer: string;
}

export interface StageHistory {
  id: string;
  applicationId: string;
  stageId: string;
  movedAt: string;
  movedBy: string;
  feedback: string | null;
  name: string;
}

export interface InterviewerWithScorecard {
  id: string;
  name: string;
  email: string;
  scorecard: {
    templateId: string;
    name: string;
    description: string;
    criteria: {
      criterionId: string;
      label: string;
      description: string | null;
      maxScore: number;
      order: number;
    }[];
  } | null;
}
