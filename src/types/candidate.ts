export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  profile?: string | null;
  skills: string[];
};
